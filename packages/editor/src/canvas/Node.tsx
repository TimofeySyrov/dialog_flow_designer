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
}> = ({ node: { label, flow, turn }, starter = false, selected, onClickAdd }) => (
  <div
    className={cn(
      "group relative",
      "rounded border-l-4",
      "bg-white text-black",
      "select-none",
      starter ? "border-red-500" : turn === Turn.BOT ? "border-blue-500" : "border-yellow-500",
      selected && "ring ring-blue-500"
    )}
    style={{
      width: nodeWidth,
      height: nodeHeight,
      padding: "4px",
      fontSize: "13px",
      fontWeight: "600",
    }}
  >
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
