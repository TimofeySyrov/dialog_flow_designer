import { Graph, GNode, Turn, GEdge, GFlow, PlotMainSpace } from "../../types";
import { Plot } from "@dialog-flow-designer/shared-types/df-parser-server";
import { nanoid } from "nanoid";

/**
 * Convert a parsed DF plot in the format outputted by the parser to a graph (nodes and edges).
 *
 * @see https://github.com/kudep/dff-parser/blob/896dae2e86f5e78b75dc51bae7423394e3c21529/parser_output.yaml
 */
export const plotToGraph = (plot: Plot): Graph => {
  const plotMainSpace: PlotMainSpace = plot.graph.script.namespaces.main.script;
  const plotNodes = plot.nodes;
  const plotEdges = plot.links;

  const NODE_REF_SEPARATOR = "script";
  const FLOW_SERVICE_CONST = "!str";
  const TRANSITION_SERVICE_CONST = "lbl.";
  const GLOBAL_FLOW = "global_flow";
  const GLOBAL_NODE = "GLOBAL";
  const NONE_NODE = "NONE";

  const flowsIds = new Set<string>();
  const flows: GFlow[] = [];
  const nodesIds = new Set<string>();
  const nodes: GNode[] = [];
  const edgeIds = new Set<string>();
  const edges: GEdge[] = [];

  const addFlow = (flow: GFlow) => {
    if (!flowsIds.has(flow.id)) {
      flowsIds.add(flow.id);
      flows.push(flow);
    }
  };

  const addNode = (node: GNode) => {
    if (!nodesIds.has(node.id)) {
      nodesIds.add(node.id);
      nodes.push(node);
    }
  };

  const addEdge = ({ fromId, toId }: GEdge) => {
    const id = `e${fromId}-${toId}`;
    if (!edgeIds.has(id)) {
      edgeIds.add(id);
      edges.push({ fromId, toId });
    }
  };

  const getCorrentNodeRef = (ref: string[]) => {
    let [flowName, nodeName] = ref.slice(
      ref.findIndex((s) => s === NODE_REF_SEPARATOR) + 1,
      ref.length
    );
    const isGlobalFlow = flowName === GLOBAL_FLOW;
    if (isGlobalFlow) flowName = `${FLOW_SERVICE_CONST} ${flowName}`;

    return [flowName, nodeName];
  };

  const getMainSpaceNode = (ref: string[]) => {
    const [flowName, nodeName] = getCorrentNodeRef(ref);
    const isGLobalNode = nodeName === undefined && flowName === GLOBAL_NODE;
    return isGLobalNode ? plotMainSpace[flowName] : plotMainSpace[flowName][nodeName];
  };

  /* Nodes filtering */
  Object.values(plotNodes).forEach((node) => {
    const { ref, id, local, start_label, fallback_label } = node;
    if (!ref) return;
    const mainSpaceNode = getMainSpaceNode(ref);

    // Adding more info
    mainSpaceNode.id = `#id${nanoid(8)}`;
    mainSpaceNode.local = local;
    if (start_label) mainSpaceNode.start_label = start_label;
    if (fallback_label) mainSpaceNode.fallback_label = fallback_label;

    // Adding id for node transitions
    if (mainSpaceNode.TRANSITIONS) {
      Object.entries(mainSpaceNode.TRANSITIONS).forEach(([toPath, tran], i) => {
        // Get TRANSITION priority
        // const isLocal = tranPathTo.startsWith(TRANSITION_SERVICE_CONST);
        // const pathWithoutBrackets = tranPathTo
        //   .match(/\((.*?)\)/)?.[0]
        //   .replace(/(^.*\(|\).*$)/g, "")
        //   .split(",");
        // const [pathFlow, pathNode] = [pathWithoutBrackets?.[0], pathWithoutBrackets?.[1]];
        // const priority = Number(pathWithoutBrackets?.[pathWithoutBrackets?.length - 1]);
        // const isPriority = !isNaN(priority) && priority > 0;
        // @ts-ignore
        mainSpaceNode.TRANSITIONS[toPath] = { label: tran, id: `#id${nanoid(8)}` };
      });
    }
  });

  /* Edges filtering */
  Object.values(plotEdges).forEach((e) => {
    const isTarget = e.target.length > 1 && e.target[0] !== NONE_NODE;
    if (!isTarget) return;

    const sourceNode = getMainSpaceNode(e.source);
    const targetNode = getMainSpaceNode(e.target);

    // @ts-ignore
    const sourceTransitionId = sourceNode.TRANSITIONS[e.label].id;
    addEdge({ fromId: sourceTransitionId, toId: targetNode.id as string });
  });

  Object.entries(plotMainSpace).forEach(([flowName, flow], index) => {
    const flowId = `#id${nanoid(8)}`;
    const isGLobalNode = flow.RESPONSE && flowName === GLOBAL_NODE;

    addFlow({ id: flowId, name: flowName, index });

    if (isGLobalNode) {
      addNode({
        id: `${flow.id}`,
        flowId,
        index: 0,
        name: flowName,
        local: Boolean(flow.local),
        response: `${flow.RESPONSE}`,
        //@ts-ignore
        transitions: Object.entries(flow.TRANSITIONS).map(([path, tran], i) => {
          //@ts-ignore
          const { id, label } = tran;
          if (id && label)
            return {
              id,
              name: label,
              index: i,
            };
        }),
        start_label: Boolean(flow.start_label),
        fallback_label: Boolean(flow.fallback_label),
      });
      return;
    }

    Object.entries(flow).forEach(([nodeName, node], index) => {
      addNode({
        id: `${node.id}`,
        flowId,
        index,
        name: nodeName,
        local: Boolean(node.local),
        response: node.RESPONSE,
        //@ts-ignore
        transitions:
          node.TRANSITIONS &&
          Object.entries(node.TRANSITIONS).map(([path, tran], index) => {
            //@ts-ignore
            const { id, label } = tran;
            if (id && label)
              return {
                id,
                name: label,
                index,
              };
          }),
        start_label: Boolean(node.start_label),
        fallback_label: Boolean(node.fallback_label),
      });
    });
  });

  return { flows, nodes, edges };
};
