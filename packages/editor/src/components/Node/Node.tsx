import { FC } from "react";

import { GNode, Turn } from "../../types";
import nodeFallbackSvg from "/icons/nodeFallback.svg";
import nodeStartSvg from "/icons/nodeStart.svg";

import styles from "./node.module.scss";

const Node: FC<{
  node: GNode;
  starter?: boolean;
  selected: boolean;
  onClickAdd: () => void;
}> = ({ node: { id, label, flow, turn }, starter = false, selected, onClickAdd }) => {
  const isCondition = turn !== Turn.BOT;
  const hasDesc = true;

  return (
    <div
      className={`node-${id.split("#").join("")} ${styles.node} ${
        !isCondition && styles.node_type_response
      } ${starter && styles.node_type_starter}`}
    >
      <div className={styles.node__container}>
        <div className={styles.node__marker}>
          {starter && <img src={nodeStartSvg} alt="Start" />}
        </div>

        {/* The Condition type part */}
        {isCondition && <span className={styles.node__priority}>0.5</span>}
        {isCondition && <span className={styles["node__func-icon"]}>{`</>`}</span>}

        <div className={styles.node__name}>
          {label}
          {/* The Start type part */}
          {starter && (
            <img className={styles.node__fallback} src={nodeFallbackSvg} alt="Fallback" />
          )}
        </div>
      </div>

      {/* The Start and Response types part */}
      {!isCondition && hasDesc && <div className={styles.node__desc}>Sample text</div>}

      <div className={styles["node__add-transition-btn"]}></div>
      {!isCondition && (
        <div
          className={`${styles["node__add-transition-btn"]} ${styles["node__add-transition-btn_child"]}`}
        ></div>
      )}
    </div>
  );
};

export default Node;
