export const data = {
  // The array of nodes
  nodes: [
    {
      id: "node1", // String, unique and required
      label: "Start node - Sample text",
      priority: 0.5,
      type: "node-start",
    },
    {
      id: "node2", // String, unique and required
      label: "Response node - Sample text",
      priority: 3,
      type: "node-response",
    },
    {
      id: "node3", // String, unique and required
      label: "Condition node - Sample text",
      priority: 1.79,
      type: "node-condition",
    },
  ],
  // The array of edges
  edges: [
    {
      source: "node1", // String, required, the id of the source node
      target: "node2", // String, required, the id of the target node
    },
    {
      source: "node2", // String, required, the id of the source node
      target: "node3", // String, required, the id of the target node
    },
  ],
};
