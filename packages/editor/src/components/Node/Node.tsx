import { FC } from "react";

import { GNode, Turn } from "../../types";
import nodeFallbackSvg from "/icons/nodeFallback.svg";
import nodeStartSvg from "/icons/nodeStart.svg";

import styles from "./node.module.scss";

export const getNodeElement = (parentRef: React.RefObject<Element>, id: string) =>
  parentRef.current?.querySelector(`.node-${id.replace("#", "")}`);

const Node: FC<{
  id: string;
  name: string;
  label?: string;
  isResponse: Boolean;
  isStarter?: Boolean;
}> = ({ id, label, name, isResponse, isStarter }) => {
  return (
    <div
      className={`node-${id.replace("#", "")} ${styles.node} ${isResponse && styles.node_type_response} ${
        isStarter && styles.node_type_starter
      }`}
    >
      <div className={styles.node__container}>
        <div className={styles.node__marker}>
          {isStarter && <img src={nodeStartSvg} alt="Start" />}
        </div>
        {/* The Condition type part */}
        {!isResponse && <span className={styles.node__priority}>0.5</span>}
        {!isResponse && <span className={styles["node__func-icon"]}>{`</>`}</span>}

        <div className={styles.node__name}>
          {name}
          {/* The Start type part */}
          {isStarter && (
            <img className={styles.node__fallback} src={nodeFallbackSvg} alt="Fallback" />
          )}
        </div>
      </div>

      {/* The Start and Response types part */}
      {isResponse && label && <div className={styles.node__desc}>{label}</div>}

      <div className={styles["node__add-transition-btn"]}></div>
      {isResponse && (
        <div
          className={`${styles["node__add-transition-btn"]} ${styles["node__add-transition-btn_child"]}`}
        ></div>
      )}
    </div>
  );
};

export default Node;
