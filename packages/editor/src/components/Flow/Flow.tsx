import { FC } from "react";

import styles from "./flow.module.scss";

export interface GFlow {
  id: string;
  flow: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const colors = ["red", "orange", "yellow", "green", "blue", "dark-blue", "purple", "pink"];
const colorMap = new Map<string, string>();
const colorFlow = (flowName: string) => {
  if (!colorMap.has(flowName)) {
    colorMap.set(flowName, colors[colorMap.size % colors.length]);
  }
  return colorMap.get(flowName);
};

const Flow: FC<{ flow: GFlow }> = ({ flow: { id, flow, x, y, width, height } }) => {
  const flowColor = colorFlow(flow);

  return (
    <div
      className={`bgFlow-${id.split("#").join("")} ${styles.flow} ${
        styles[`flow_color_${flowColor}`]
      }`}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width,
        height,
      }}
    ></div>
  );
};

export default Flow;
