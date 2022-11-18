import { FC } from "react";

import { XY } from "../../types";
import { columnGap, rowGap } from "../../utils/helpers/layout";
import { getBlockElement } from "../Block/Block";

import styles from "./flow.module.scss";

export interface GFlow {
  id: string;
  flow: string;
  coords: XY;
  width: number;
  height: number;
}

const idTemplate = (id: string): string => `flow-${id.split("#").join("")}`;

export const getFlowElement = (parentRef: React.RefObject<Element>, id: string) =>
  parentRef.current?.querySelector(`.${idTemplate(id)}`);

/**
 * The `Flow` is attached to the `Block`, and they both have the same `id`
 */
export const updateFlowPosition = (parentRef: React.RefObject<Element>, id: string): void => {
  const flowEl = getFlowElement(parentRef, id) as HTMLElement;
  const blockElSize = getBlockElement(parentRef, id)?.getBoundingClientRect();

  if (!parentRef && !flowEl && !blockElSize) return;
  const { width, height, left, top } = blockElSize!;
  const { offsetLeft, offsetTop } = parentRef.current! as HTMLElement;

  flowEl.style.width = width + columnGap + 6 + "px";
  flowEl.style.height = height + rowGap + 6 + "px";
  flowEl.style.transform = `translate(${left - offsetLeft - columnGap / 2 - 3}px, ${
    top - offsetTop - rowGap / 2 - 3
  }px)`;
};

export const colors = ["red", "orange", "yellow", "green", "blue", "dark-blue", "purple", "pink"];
const colorMap = new Map<string, string>();
const flowColor = (flowName: string) => {
  if (!colorMap.has(flowName)) {
    colorMap.set(flowName, colors[colorMap.size % colors.length]);
  }
  return colorMap.get(flowName);
};

const Flow: FC<GFlow> = ({ id, flow, coords, width, height }) => {
  return (
    <div
      className={`${idTemplate(id)} ${styles.flow} ${styles[`flow_color_${flowColor(flow)}`]}`}
      style={{
        transform: `translate(${coords.x}px, ${coords.y}px)`,
        width,
        height,
      }}
    ></div>
  );
};

export default Flow;
