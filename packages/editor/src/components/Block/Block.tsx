import { FC } from "react";
import { GNode, Size, XY } from "../../types";
import Node from "../Node/Node";

import styles from "./block.module.scss";

export interface GBlock {
  block: {
    response: GNode;
    conditions?: GNode[];
  };
  starter?: Boolean;
  layoutPos: XY;
}

export const getBlockElement = (parentRef: React.RefObject<Element>, id: string) =>
  parentRef?.current?.querySelector(`.block-${id.split("#").join("")}`);

export const updateBlockPosition = (
  parentRef: React.RefObject<Element>,
  blockId: string,
  coords: XY
): void => {
  const el = getBlockElement(parentRef, blockId) as HTMLElement;
  el.style.transform = `translate(${coords.x}px, ${coords.y}px)`;
};

const Block: FC<GBlock> = ({ block, starter, layoutPos }) => {
  const hasConditions = Boolean(block.conditions?.length);

  return (
    <div
      className={`block-${block.response.id.split("#").join("")} ${styles.block}`}
      style={{ transform: `translate(${layoutPos.x}px, ${layoutPos.y}px)` }}
    >
      <Node
        node={block.response}
        selected={false}
        starter={Boolean(starter)}
        onClickAdd={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
      {hasConditions && (
        <div className={styles.block__conditions}>
          {block.conditions?.map((node) => (
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
