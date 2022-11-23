// Private types of the editor

export interface XY {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Property {
  type: string;
  value: string;
}

export enum Turn {
  USER,
  BOT,
}

export interface PlotMainSpace {
  [flowName: string]: {
    [nodeName: string]: {
      RESPONSE: string;
      TRANSITIONS: {
        [transitionPath: string]: string | { label: string, id: string };
      };
      id?: string;
      local?: Boolean;
      start_label?: Boolean;
      fallback_label?: Boolean;
      flowId?: string;
    };
  };
}

export interface GFlow {
  id: string;
  name: string;
  index: number;
}

export interface GNode {
  id: string;
  flowId: string;
  name: string;
  index: number;
  local?: Boolean;
  response?: string;
  transitions?: {
    id: string;
    name: string;
    index: number;
    type?: "forward" | "previous" | "fallback" | "repeat" | "backward";
  }[];
  suggestions?: string[];
  start_label?: Boolean;
  fallback_label?: Boolean;
}

export interface GEdge {
  fromId: string;
  toId: string;
}

export interface Graph {
  flows: GFlow[];
  nodes: GNode[];
  edges: GEdge[];
}

export type NewNode = Omit<GNode, "id">;

export interface AutocompArgs {
  // Input
  input: string;

  // Context
  turn: Turn;
  currentProp: Partial<Property>;
  otherProps: Property[];
  previousProps: Property[];

  // Options
  limit: number;

  // Cache
  cache: Record<string, any>;
}

export type SuggestionData = Partial<Property> & {
  /**
   * Scores go from `-Infinity` to `0`.
   */
  score: number;
};

export enum Mode {
  DEFAULT,
  EDIT,
  ADD,
}

export const STRUCTURE_RENDER_TYPE = "structure";
export const AUTO_RENDER_TYPE = "auto";

export type GraphRenderType = typeof STRUCTURE_RENDER_TYPE | typeof AUTO_RENDER_TYPE;

/**
 * Renderable form of plot as an edge list
 */
// export interface Graph {
//   nodes: {
//     type: string;
//     data: {
//       label: string;
//       flow: string;
//     };
//     position: {
//       x: number;
//       y: number;
//     };
//   }[];
//   edges: {
//     source: number;
//     target: number;
//   }[];
// }
