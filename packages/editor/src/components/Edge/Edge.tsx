import { FC } from "react";
import shallow from "zustand/shallow";

import pick from "../../utils/helpers/pick";
import { hoverEdge, useStore } from "../../store";
import { GEdge, XY } from "../../types";

import styles from "./edge.module.scss";
import { getNodeElement } from "../Node/Node";

const c = 30;

export interface EdgeSubPathD extends XY {
  width: number;
  height: number;
}

export interface EdgePathD {
  from: EdgeSubPathD;
  to: EdgeSubPathD;
}

export const getPathD = ({ from, to }: EdgePathD) => {
  const fromX = from.x + from.width;
  const fromY = from.y + from.height / 2;
  const toX = to.x;
  const toY = to.y + to.height / 2;
  const backlink = fromX > toX;
  const curve = backlink
    ? `h ${c} C ${fromX} ${fromY + c * 3}, ${toX} ${toY + c * 3}, ${toX - c} ${toY} h ${c}`
    : `C ${fromX + c} ${fromY}, ${toX - c} ${toY}, ${toX} ${toY}`;
  const d = `M ${fromX} ${fromY} ${curve}`;
  return d;
};

export const getEdgeElements = (parentRef: React.RefObject<Element>, { fromId, toId }: GEdge) =>
  parentRef.current?.querySelectorAll(
    `.edge-${fromId.split("#").join("")}-${toId.split("#").join("")}`
  );

export const updateEdgePosition = (parentRef: React.RefObject<Element>, edge: GEdge): void => {
  if (!parentRef) return;
  const edgeElements = getEdgeElements(parentRef, edge);
  const fromNode = getNodeElement(parentRef, edge.fromId);
  const toNode = getNodeElement(parentRef, edge.toId);
  if (!fromNode && !toNode) return;
  const { offsetLeft, offsetTop } = parentRef.current! as HTMLElement;
  const fromNodeSize = fromNode!.getBoundingClientRect();
  const toNodeSize = toNode!.getBoundingClientRect();

  const newPathD = getPathD({
    from: {
      width: fromNodeSize.width,
      height: fromNodeSize.height,
      x: fromNodeSize.left - offsetLeft,
      y: fromNodeSize.top - offsetTop,
    },
    to: {
      width: toNodeSize.width,
      height: toNodeSize.height,
      x: toNodeSize.left - offsetLeft,
      y: toNodeSize.top - offsetTop,
    },
  });

  edgeElements?.forEach((el) => el?.setAttribute("d", newPathD));
};

const Edge: FC<{ edge: GEdge; pathPoints: EdgePathD }> = ({
  edge: { fromId, toId },
  pathPoints,
}) => {
  const { highlightedEdges } = useStore(pick("highlightedEdges"), shallow);
  const highlighted = highlightedEdges.has(`${fromId}-${toId}`);

  // const hoverPathRef = useRef<SVGPathElement>(null);
  // const displayPathRef = useRef<SVGPathElement>(null);
  // const fromPosRef = useRef<XY>({ x: 0, y: 0 });
  // const toPosRef = useRef<XY>({ x: 0, y: 0 });
  // useEffect(
  //   () =>
  //     useStore.subscribe((state) => {
  //       const newFromPos = addXY(fromLayoutPos, state.nodeOffsets[fromId]);
  //       const newToPos = addXY(toLayoutPos, state.nodeOffsets[toId]);
  //       if (
  //         newFromPos.x !== fromPosRef.current.x ||
  //         newFromPos.y !== fromPosRef.current.y ||
  //         newToPos.x !== toPosRef.current.x ||
  //         newToPos.y !== toPosRef.current.y
  //       ) {
  //         const d = computePathD(fromPosRef.current, toPosRef.current);
  //         hoverPathRef.current?.setAttribute("d", d);
  //         displayPathRef.current?.setAttribute("d", d);
  //       }
  //     }),
  //   [fromId, fromLayoutPos, toId, toLayoutPos]
  // );

  return (
    <>
      {/* Invisible wide path for easier hovering */}
      <path
        className={`edge-${fromId.split("#").join("")}-${toId.split("#").join("")} ${
          styles["edge-invisible"]
        }`}
        d={getPathD(pathPoints)}
        onMouseEnter={() => hoverEdge(fromId, toId)}
        onMouseLeave={() => hoverEdge(null)}
      />

      {/* Actual visible path */}
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <path
        className={`edge-${fromId.split("#").join("")}-${toId.split("#").join("")} ${styles.edge}`}
        markerEnd={"url(#arrow)"}
        // style={{
        //   fill: "transparent",
        //   stroke: highlighted ? "rgba(52, 211, 153)" : "grey",
        //   strokeWidth: highlighted ? "3" : "1",
        //   shapeRendering: "geometricPrecision",
        //   pointerEvents: "none",
        // }}
        d={getPathD(pathPoints)}
      />
    </>
  );
};

export default Edge;
