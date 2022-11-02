import cn from "classnames";
import { FC } from "react";

import { GNode, Turn } from "../types";
import IconAddFilled from "~icons/carbon/add-filled";

export const nodeWidth = 262;
export const nodeHeight = 24;

/**
 * Purely representational node component.
 */
const Node: FC<{
  node: GNode;
  starter?: boolean;
  selected: boolean;
  onClickAdd: () => void;
}> = ({ node: { id, label, flow, turn }, starter = false, selected, onClickAdd }) => (
  <div
    className={
      cn(
        "group relative",
        "bg-white text-black",
        "select-none"
        // starter ? "border-red-500" : turn === Turn.BOT ? "border-blue-500" : "border-yellow-500",
        // selected && "ring ring-blue-500"
      ) + ` node-${id.split("#").join("")}`
    }
    style={{
      width: nodeWidth,
      height: nodeHeight,
      padding: "4px",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
    }}
  >
    {/* Marker */}
    <div
      style={{
        width: "4px",
        height: "100%",
        borderRadius: "2px",
        backgroundColor: starter ? "#00CC99" : turn === Turn.BOT ? "#3399CC" : "#FF9500",
        marginRight: "6px",
      }}
    ></div>

    {/* Priority label */}
    {turn !== Turn.BOT && (
      <div
        style={{
          fontSize: "11px",
          marginRight: "6px",
          color: "#8D96B5",
        }}
      >
        0.5
      </div>
    )}

    {/* Node Label */}
    {label}

    <div className="h-full left-full top-0 w-10 hidden absolute items-center justify-center display-none hover:flex group-hover:flex">
      <div
        className="bg-white cursor-pointer rounded-1 h-[18px] w-[18px] relative"
        onClick={(ev) => (ev.stopPropagation(), onClickAdd())}
      >
        <IconAddFilled
          style={{
            transform: "translate(-3px, -3px)",
          }}
          fontSize="22"
          color="#10b981"
        />
      </div>
    </div>
  </div>
);

export default Node;
