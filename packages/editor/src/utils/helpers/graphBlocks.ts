import { useMemo } from "react";

import { GNode, Graph } from "../../types";

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

export const getClearId = (id: string, symbolForRemove: string) =>
  id.split(symbolForRemove).join("");

export const useGraphBlocks = (graph: Graph) => useMemo(() => getGraphBlocks(graph), [graph]);
