import React, { FC } from "react";
import cn from "classnames";

import { GNode, XY } from "../types";
import Node from "./Node";

export const blockWidth = 272;
export const blockHeight = 100;

const Block: FC<{
  block: {
    response: GNode;
    conditions?: GNode[];
  };
  layoutPos: XY;
}> = ({ block: { response, conditions }, layoutPos: { x: layoutX, y: layoutY } }) => {
  const hasConditions = Boolean(conditions?.length);

  return (
    <div
      className={cn("absolute")}
      style={{
        width: `${blockWidth}px`,
        borderRadius: "10px",
        backgroundColor: "white",
        padding: "4px",
        transform: `translate(${layoutX}px, ${layoutY}px)`,
      }}
    >
      <div
        style={{
          borderBottom: hasConditions ? "2px solid rgba(51, 0, 255, 0.1)" : "none",
        }}
      >
        <Node
          node={response}
          selected={false}
          onClickAdd={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "4px" }}>
        {hasConditions &&
          conditions?.map((node) => (
            <Node
              key={node.id}
              node={node}
              selected={false}
              onClickAdd={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default Block;
