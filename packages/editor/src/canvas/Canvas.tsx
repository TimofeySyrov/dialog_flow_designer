import React, { FC, useRef, useState, useEffect } from "react";
import * as Rematrix from "rematrix";
import cn from "classnames";
import shallow from "zustand/shallow";
import useResizeObserver from "use-resize-observer";

import bookPlot from "../__mocks__/mockPlotWithFlows";
import useStore, { applyViewTransforms, endJump, useGraph } from "../store";
import pick from "../utils/pick";
import { BSizes, columnGap, getLayout, rowGap, useLayout } from "../utils/layout";
import { useGraphBlocks } from "../utils/graphBlocks";
import { plotToGraph } from "../utils/plot";
import { GEdge, XY } from "../types";

import Edge, { getPathD } from "./Edge";
import Block, { blockHeight, blockWidth } from "./Block";

const scrollSpeedModifier = 0.5;
const maxZoom = 1;
const minZoom = 0.1;

// This coloring was added last-minute for demo purposes
// It should be replaced by something more robust
const colors = ["#e9a7a1", "#ecbaa2", "#edd9a3", "#a2e2b0", "#b1c8ed", "#b3abdf", "#edc2d5"];
const colorMap = new Map<string, string>();
const colorFlow = (flowName: string) => {
  if (!colorMap.has(flowName)) {
    colorMap.set(flowName, colors[colorMap.size % colors.length]);
  }
  return colorMap.get(flowName);
};

const Canvas: FC<{ zoomWithControl?: boolean }> = ({ zoomWithControl = true }) => {
  useStore.setState({
    // viewTransform: Rematrix.multiply(Rematrix.scale(0.4), Rematrix.translate(300, 50)),
    graph: plotToGraph(bookPlot),
  });
  const { viewTransform, viewportJumping } = useStore(
    pick("viewTransform", "viewportJumping"),
    shallow
  );

  const graph = useGraph();
  const graphBlocks = useGraphBlocks(graph);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Update the canvas size in store, which is used for calculating viewport transform
  // when focusing a set point.
  useResizeObserver<HTMLDivElement>({
    ref: canvasRef,
    onResize: ({ height = 0, width = 0 }) => {
      useStore.setState({ canvasSize: { width, height } });
    },
  });

  // Handle control key (used for panning with mouse when held), and prevent ctrl+scroll
  // causing page level zoom
  const [ctrlHeld, setCtrlHeld] = useState(false);
  useEffect(() => {
    const blockSizes = getBlockSizes();
    const layoutPos = getLayout(graph, blockSizes);
    graphBlocks.forEach(({ response }) => {
      updateNodePosition(response.id, layoutPos[response.id]);
      updateFlowBgPosition(response.id);
    });

    graph.edges.forEach((e) => updateEdgePosition(e));

    // const handleKeyDown = (ev: KeyboardEvent) => ev.key === "Control" && setCtrlHeld(true);
    // const handleKeyUp = (ev: KeyboardEvent) => ev.key === "Control" && setCtrlHeld(false);
    // const preventZoom = (ev: MouseEvent) => ev.preventDefault();
    // window.addEventListener("keydown", handleKeyDown);
    // window.addEventListener("keyup", handleKeyUp);
    // window.addEventListener("wheel", preventZoom, { passive: false });
    // return () => {
    //   window.removeEventListener("keydown", handleKeyDown);
    //   window.removeEventListener("keyup", handleKeyUp);
    //   window.removeEventListener("wheel", preventZoom);
    // };
  }, []);

  const getBlockSizes = () => {
    const blocksWithSizes = new Map<string, BSizes>();

    graphBlocks.forEach(({ response }) => {
      const el = canvasRef.current?.querySelector(`.block-${response.id.split("#").join("")}`);
      const { width, height } = el?.getBoundingClientRect() || { width: 0, height: 0 };
      blocksWithSizes.set(response.id, { width, height });
    });

    return blocksWithSizes;
  };

  const getEdgeElements = ({ fromId, toId }: GEdge) => {
    return canvasRef.current?.querySelectorAll(
      `.edge-${fromId.split("#").join("")}-${toId.split("#").join("")}`
    );
  };

  const getBlockElement = (id: string) => {
    return canvasRef.current?.querySelector(
      `.block-${id.split("#").join("")}`
    ) as HTMLElement | null;
  };

  const getNodeElement = (id: string) => {
    return canvasRef.current?.querySelector(
      `.node-${id.split("#").join("")}`
    ) as HTMLElement | null;
  };

  const getBlockFlowBgElement = (id: string) => {
    return canvasRef.current?.querySelector(
      `.bgFlow-${id.split("#").join("")}`
    ) as HTMLElement | null;
  };

  const updateNodePosition = (id: string, coords: XY) => {
    const el = getBlockElement(id);
    if (el !== null) {
      el.style.transform = `translate(${coords.x}px, ${coords.y}px)`;
    }
  };

  const updateEdgePosition = (edge: GEdge) => {
    const edgeElements = getEdgeElements(edge);
    const fromNode = getNodeElement(edge.fromId)?.getBoundingClientRect();
    const toNode = getNodeElement(edge.toId)?.getBoundingClientRect();

    if (fromNode !== undefined && toNode !== undefined) {
      const pathD = getPathD({
        from: {
          width: fromNode.width,
          height: fromNode.height,
          x: fromNode.x,
          y: fromNode.y,
        },
        to: {
          width: toNode.width,
          height: toNode.height,
          x: toNode.x,
          y: toNode.y,
        },
      });

      edgeElements?.forEach((el) => el?.setAttribute("d", pathD));
    }
  };

  const updateFlowBgPosition = (blockId: string) => {
    const bgEl = getBlockFlowBgElement(blockId);
    const blockElSizes = getBlockElement(blockId)?.getBoundingClientRect();

    if (bgEl !== null && blockElSizes !== undefined) {
      const width = blockElSizes.width + columnGap + 6;
      const height = blockElSizes.height + rowGap + 6;

      bgEl.style.width = width + "px";
      bgEl.style.height = height + "px";
      bgEl.style.transform = `translate(${blockElSizes.x - columnGap / 2 - 3}px, ${
        blockElSizes.y - rowGap / 2 - 3
      }px)`;
    }
  };

  // Just in case control was pressed/released outside of our window
  const handleMouseEnter: React.MouseEventHandler = (ev) =>
    ctrlHeld !== ev.ctrlKey && setCtrlHeld(ev.ctrlKey);

  // // Handle panning with mouse
  const [isPanning, setPanning] = useState(false);
  const handleMouseMove: React.MouseEventHandler = (ev) => {
    if (isPanning && ev.buttons === 1 && ev.ctrlKey) {
      ev.preventDefault();
      ev.stopPropagation();
      applyViewTransforms(Rematrix.translate(ev.movementX, ev.movementY));
      // The window might not have had the focus when the panning started,
      // but it definitely has it now
      if (!ctrlHeld) setCtrlHeld(true);
    }
  };
  const handleMouseDown = () => setPanning(true);
  const handleMouseUp = () => setPanning(false);

  // Handle scrolling
  const handleWheel: React.WheelEventHandler = (ev) => {
    const { deltaX, deltaY, clientX, clientY } = ev;
    if ((ev.ctrlKey && zoomWithControl) || (!zoomWithControl && ev.shiftKey)) {
      // The window might not have had the focus when the panning started,
      // but it definitely has it now
      if (!ctrlHeld) setCtrlHeld(true);

      // Zooming with control/shift pressed
      const zoom = viewTransform[/* scale */ 0];
      if (
        !viewportRef.current ||
        !canvasRef.current ||
        (zoom >= maxZoom && deltaY < 0) ||
        (zoom <= minZoom && deltaY > 0)
      )
        return;
      const zoomMul = deltaY < 0 ? 1.1 : 0.9;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = clientX - canvasRect.x;
      const mouseY = clientY - canvasRect.y;
      applyViewTransforms(
        Rematrix.translate(-mouseX, -mouseY),
        Rematrix.scale(zoomMul),
        Rematrix.translate(mouseX, mouseY)
      );
    } else {
      // Scrolling (panning)
      if (ev.shiftKey) {
        // Shift pressed -> scroll horizontally
        applyViewTransforms(Rematrix.translate(-deltaY * scrollSpeedModifier, 0));
      } else {
        applyViewTransforms(Rematrix.translate(-deltaX, -deltaY * scrollSpeedModifier));
      }
    }
  };

  return (
    <div
      ref={canvasRef}
      className="h-full bg-neutral-200 w-full overflow-hidden"
      style={{ cursor: ctrlHeld ? "move" : "default" }}
      // onMouseDown={handleMouseDown}
      // onMouseUp={handleMouseUp}
      // onMouseMove={handleMouseMove}
      // onMouseEnter={handleMouseEnter}
      // onWheel={handleWheel}
    >
      <div
        ref={viewportRef}
        className={cn(
          "h-full w-full relative origin-top-left",
          viewportJumping && "transition-transform"
        )}
        onTransitionEnd={endJump}
        style={{
          transform: Rematrix.toString(viewTransform),
        }}
      >
        {graphBlocks.map(({ response }) => {
          const pos = { x: 0, y: 0 };
          const width = blockWidth + columnGap + 6;
          const height = blockHeight + rowGap + 6;
          return (
            <div
              key={"bg" + response.id}
              className={
                "absolute pointer-events-none" + ` bgFlow-${response.id.split("#").join("")}`
              }
              style={{
                transform: `translate(${pos.x - columnGap / 2 - 3}px, ${pos.y - rowGap / 2 - 3}px)`,
                background: `${colorFlow(response.flow)}`,
                width,
                height,
                zIndex: -2,
              }}
            ></div>
          );
        })}

        <svg
          version="1.1"
          baseProfile="full"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full top-0 left-0 absolute overflow-visible"
          style={{ zIndex: -1 }}
        >
          {graph.edges.map((e) => {
            const fromBlock = graphBlocks.find((b) => b.response.id === e.fromId);
            const isFromBlock = fromBlock !== undefined;

            if (isFromBlock) {
              const toIdIsBlockChild =
                fromBlock.conditions?.find((c) => c.id === e.toId) !== undefined;

              if (toIdIsBlockChild) return;
            }

            return (
              <Edge
                key={e.fromId + e.toId}
                edge={e}
                pathPoints={{
                  from: { width: 0, height: 0, x: 0, y: 0 },
                  to: { width: 0, height: 0, x: 0, y: 0 },
                }}
              />
            );
          })}
        </svg>
        {graphBlocks.map((block) => (
          <Block key={block.response.id} block={block} layoutPos={{ x: 0, y: 0 }} />
        ))}
        {/* {graph.nodes.map((node) => (
          <CanvasNode key={node.id} node={node} layoutPos={nodeLayoutPositions[node.id]} />
        ))} */}
      </div>
    </div>
  );
};

export default Canvas;
