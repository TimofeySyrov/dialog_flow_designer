import { useMemo } from "react";
import { nodeHeight } from "../canvas/Node";
import { GNode, Graph, XY } from "../types";

export interface Block {
  response: GNode;
  conditions?: GNode[];
}

export const getGraphBlocks = (graph: Graph) => {
  const responseNodes = graph.nodes.filter((node) => node.turn === 1);

  const blocks: Block[] = [];

  responseNodes.forEach((node) => {
    const currentNodeEdges = graph.edges.filter((edge) => edge.fromId === node.id);
    const currentNodeConditions = graph.nodes.filter(
      (node) => node.turn !== 1 && currentNodeEdges.find((edge) => edge.toId === node.id)
    );
    const blockIsExist = blocks.find((block) => block.response.id === node.id);

    if (!blockIsExist) {
      blocks.push({ response: node, conditions: [] });
    }

    if (currentNodeConditions.length > 0) {
      blocks.map((block) => {
        if (block.response.id === node.id) {
          block.conditions = currentNodeConditions;
        }
        return block;
      });
    }
  });

  return blocks;
};

export const getNodePositionByBlock = (info: {
  id: string;
  graph: Graph;
  layoutPositions: Record<string, XY>;
  graphBlocks: Block[];
}) => {
  const { id, graph, layoutPositions, graphBlocks } = info;
  // If Node is Response, then return existing Node position
  const responseNodes = graph.nodes.filter((node) => node.turn === 1);
  const isResponseNode = Boolean(responseNodes.find((node) => node.id === id));
  if (isResponseNode) return layoutPositions[id];

  // If Node is Condition, then
  // 1. Find Response by current Condition
  // 2. Get Condition index in Response conditions array
  // 3. Add gap for Y coordinate by NodeHeight * Condition index
  const conditionBlock = graphBlocks.find((block) =>
    block.conditions?.find((cnode) => cnode.id === id)
  );
  const parentPos = layoutPositions[`${conditionBlock?.response.id}`];
  const conditionIndexByParent = conditionBlock?.conditions?.map((n) => n.id).indexOf(id) || 0;

  return Boolean(parentPos)
    ? {
        x: parentPos.x,
        y: parentPos.y + nodeHeight * (conditionIndexByParent + 1),
      }
    : layoutPositions[id];
};

export const useGraphBlocks = (graph: Graph) => useMemo(() => getGraphBlocks(graph), [graph]);
