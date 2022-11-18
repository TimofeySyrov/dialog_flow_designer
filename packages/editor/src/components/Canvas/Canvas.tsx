import React, { FC, useRef, useState, useEffect, useCallback } from "react";
import * as Rematrix from "rematrix";
import cn from "classnames";
import shallow from "zustand/shallow";
import useResizeObserver from "use-resize-observer";

import bookPlot from "../../__mocks__/mockPlotWithFlows";
import pick from "../../utils/helpers/pick";
import { getLayout } from "../../utils/helpers/layout";
import { useGraphBlocks } from "../../utils/helpers/graphBlocks";
import { plotToGraph } from "../../utils/helpers/plot";
import useStore, { applyViewTransforms, endJump, useGraph } from "../../store";
import { Size, GraphRenderType } from "../../types";
import Edge, { updateEdgePosition } from "../Edge/Edge";
import Block, { getBlockElement, updateBlockPosition } from "../Block/Block";
import Flow, { updateFlowPosition } from "../Flow/Flow";
import Grid from "../Grid/Grid";

import styles from "./canvas.module.scss";

const scrollSpeedModifier = 0.5;
const maxZoom = 1;
const minZoom = 0.1;

useStore.setState({
  graph: plotToGraph(bookPlot),
});

const Canvas: FC<{ zoomWithControl?: boolean }> = ({ zoomWithControl = true }) => {
  const { viewTransform, viewportJumping } = useStore(
    pick("viewTransform", "viewportJumping"),
    shallow
  );
  const { renderType, grid, canvasSize } = useStore();
  const graph = useGraph();
  const graphBlocks = useGraphBlocks(graph);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Handle control key (used for panning with mouse when held), and prevent ctrl+scroll
  // causing page level zoom
  const [ctrlHeld, setCtrlHeld] = useState(false);

  // Update the canvas size in store, which is used for calculating viewport transform
  // when focusing a set point.
  useResizeObserver<HTMLDivElement>({
    ref: canvasRef,
    onResize: ({ height = 0, width = 0 }) => {
      const scrollWidth = viewportRef.current?.scrollWidth || 0;
      const scrollHeight = viewportRef.current?.scrollHeight || 0;

      useStore.setState({ canvasSize: { width: scrollWidth, height: scrollHeight } });
    },
  });

  const getBlockSizes = () => {
    const blocksWithSizes = new Map<string, Size>();

    graphBlocks.forEach(({ response }) => {
      const size = getBlockElement(canvasRef, response.id)?.getBoundingClientRect();
      if (!size) return;
      blocksWithSizes.set(response.id, { width: size.width, height: size.height });
    });

    return blocksWithSizes;
  };

  const updateCanvas = (renderTypeState: GraphRenderType) => {
    // Remove viewport transform for correct rerender without transform style context
    viewportRef.current!.style.transform = "";
    const blockSizes = getBlockSizes();
    const layoutPos = getLayout(graph, blockSizes, renderTypeState);

    // Update Blocks, Flows, Edges positions
    graphBlocks.forEach(({ response }) => {
      updateBlockPosition(canvasRef, response.id, layoutPos[response.id]);
      updateFlowPosition(canvasRef, response.id);
    });
    graph.edges.forEach((e) => updateEdgePosition(canvasRef, e));

    //Update canvasSize and Grid component
    if (viewportRef.current) {
      /* Hide Grid component to get correct scroll values
      not considering grid sizes */
      gridRef.current && (gridRef.current.style.display = "none");
      useStore.setState({
        canvasSize: {
          width: viewportRef.current.scrollWidth,
          height: viewportRef.current.scrollHeight,
        },
      });
      gridRef.current && (gridRef.current.style.display = "block");
    }

    // Update matrix after updating all of positions
    useStore.setState({
      viewTransform: Rematrix.multiply(Rematrix.scale(0.25), Rematrix.translate(300, 50)),
    });
    viewportRef.current!.style.transform = Rematrix.toString(useStore.getState().viewTransform);
  };

  useEffect(() => {
    updateCanvas(renderType);
    // Rerender Canvas, when renderType is changed
    useStore.subscribe((state) => state.renderType, updateCanvas);

    const handleKeyDown = (ev: KeyboardEvent) => ev.key === "Control" && setCtrlHeld(true);
    const handleKeyUp = (ev: KeyboardEvent) => ev.key === "Control" && setCtrlHeld(false);
    const preventZoom = (ev: MouseEvent) => ev.preventDefault();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("wheel", preventZoom, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", preventZoom);
    };
  }, []);

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
      className={styles.canvas}
      style={{ cursor: ctrlHeld ? "move" : "default" }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onWheel={handleWheel}
    >
      <div
        ref={viewportRef}
        className={`${styles.canvas__viewport} ${cn(viewportJumping && "transition-transform")}`}
        onTransitionEnd={endJump}
        style={{
          transform: Rematrix.toString(viewTransform),
        }}
      >
        {grid && (
          <div ref={gridRef}>
            <Grid width={canvasSize.width} height={canvasSize.height} />
          </div>
        )}

        {graphBlocks.map(({ response }) => {
          const { id, flow } = response;

          return (
            <Flow
              key={"bg" + id}
              id={id}
              flow={flow}
              coords={{ x: 0, y: 0 }}
              width={0}
              height={0}
            />
          );
        })}

        <svg
          version="1.1"
          baseProfile="full"
          xmlns="http://www.w3.org/2000/svg"
          className={styles["canvas__svg-edges"]}
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
        {graphBlocks.map((b) => (
          <Block
            key={b.response.id}
            block={b}
            layoutPos={{ x: 0, y: 0 }}
            starter={b.response.label === "start"}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
