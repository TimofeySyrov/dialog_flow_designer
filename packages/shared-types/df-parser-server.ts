// This module contains the types shared by the python server and the typescript
// process talking to it (either the extension or Dream Builder)

export type NodeType = "global" | "local" | "regular";

/**
 * Parsed form of plot, as received from the parser
 */
export interface Plot {
  directed: Boolean;
  multigraph: Boolean;
  graph: {
    script: {
      namespaces: {
        main: {
          script: {
            [flowId: string]: {
              [nodeId: string]: {
                RESPONSE: string;
                TRANSITIONS: {
                  [transitionId: string]: string;
                };
                PROCESSING?: {
                  [processingId: string]: string;
                };
                MISC?: {
                  [miscId: string]: string;
                };
              };
            };
          };
        };
      };
    };
  };
  nodes: {
    ref: string[];
    local: Boolean;
    id: string[];
    start_label?: Boolean;
    fallback_label?: Boolean;
  }[];
  links: {
    label_ref: string[];
    label: string;
    condition_ref: string[];
    condition: string[];
    source: string[];
    target: string[];
    key: number;
  }[];
}

// Message types passed to python from parent process

/**
 * Base interface for message passed from parent process -> Python
 */
interface MessageBase {
  /**
   * Random unique id
   */
  id: string;

  /**
   * Type of message (action)
   */
  name: string;

  /**
   * Optional payload
   */
  payload?: object;
}

/**
 * Parse a new or changed python module and return the parsed plot ({@link Plot})
 */
export interface ParseSrc extends MessageBase {
  name: "parse_src";
  payload: {
    source: string;
  };
}

/**
 * Update (patch) and object in the plot and return the updated source code
 */
export interface PutObj extends MessageBase {
  name: "put_obj";
  payload: {
    objid: string;
    update: Record<string, string>;
  };
}

/**
 * Create a new object in the plot and return the updated source code
 */
export interface PostObject extends MessageBase {
  name: "post_obj";
  payload: {
    type: string;
    props: Record<string, string>;
  };
}

// Messages (replies) passed from Python -> parent process

interface ReplyBase {
  /**
   * Unique identifier of the message we are replying to
   */
  msgId: string;

  /**
   * Optional payload
   */
  payload?: object;
}

/**
 * Result of parsing a dff plot (script)
 */
export interface PlotReply extends ReplyBase {
  payload: {
    plot: Plot;
  };
}

/**
 * Resulting python source code after updating a dff plot
 */
export interface SrcReply extends ReplyBase {
  payload: {
    source: string;
  };
}

/**
 * Discriminated union of message-reply tuples passed between Python and the
 * parent process. Rememeber to add new message and reply types here.
 */
export type MessageAndReply = [ParseSrc, PlotReply] | [PutObj, SrcReply] | [PostObject, SrcReply];
