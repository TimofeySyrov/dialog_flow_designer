import { FC } from "react";

import { GNode, XY } from "../../types";
import Node from "../Node/Node";

import styles from "./block.module.scss";

const Block: FC<{
  block: {
    response: GNode;
    conditions?: GNode[];
  };
  starter?: Boolean;
  layoutPos: XY;
}> = ({ block: { response, conditions }, layoutPos: { x: layoutX, y: layoutY }, starter }) => {
  const hasConditions = Boolean(conditions?.length);

  return (
    <div
      className={`block-${response.id.split("#").join("")} ${styles.block}`}
      style={{
        transform: `translate(${layoutX}px, ${layoutY}px)`,
      }}
    >
      <Node
        node={response}
        selected={false}
        starter={Boolean(starter)}
        onClickAdd={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
      {hasConditions && (
        <div className={styles.block__conditions}>
          {conditions?.map((node) => (
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
      )}

      <div className={styles["block__suggestions-btn"]}>show suggestions</div>
    </div>
  );
};

export default Block;
