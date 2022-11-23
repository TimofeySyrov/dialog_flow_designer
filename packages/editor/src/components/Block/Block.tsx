import { FC } from "react";
import { GNode, Size, XY } from "../../types";
import Node from "../Node/Node";

import styles from "./block.module.scss";

export interface GBlock {
  block: GNode;
  layoutPos: XY;
}

export const getBlockElement = (parentRef: React.RefObject<Element>, id: string) =>
  parentRef?.current?.querySelector(`.block-${id.replace("#", "")}`);

export const updateBlockPosition = (
  parentRef: React.RefObject<Element>,
  blockId: string,
  coords: XY
): void => {
  const el = getBlockElement(parentRef, blockId) as HTMLElement;
  el.style.transform = `translate(${coords.x}px, ${coords.y}px)`;
};

const Block: FC<GBlock> = ({ block, layoutPos }) => {
  const hasConditions = Boolean(block.transitions?.length);

  return (
    <div
      className={`block-${block.id.replace("#", "")} ${styles.block}`}
      style={{ transform: `translate(${layoutPos.x}px, ${layoutPos.y}px)` }}
    >
      <Node
        id={block.id}
        name={block.name}
        label={block.response}
        isResponse={true}
        isStarter={Boolean(block.start_label)}
      />
      {hasConditions && (
        <div className={styles.block__conditions}>
          {block.transitions
            ?.sort((a, b) => a.index - b.index)
            ?.map((tran) => (
              <Node key={tran.id} id={tran.id} name={tran.name} isResponse={false} />
            ))}
        </div>
      )}

      <div className={styles["block__suggestions-btn"]}>show suggestions</div>
    </div>
  );
};
export default Block;
