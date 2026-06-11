// Real-time collaboration op protocol + binary codec.
//
// Local node/edge changes are encoded as compact MessagePack, deflate-compressed,
// and sent as a BINARY WebSocket frame. Remote frames are inflated + decoded back
// into an op object and applied to the canvas. Keys are kept short to save bytes.

import { encode, decode } from "@msgpack/msgpack";
import { deflateSync, inflateSync } from "fflate";
import type { Edge, Node } from "reactflow";

/** Full node.data after a change. */
export interface NodeUpdateOp {
  t: "nu";
  id: string;
  data: unknown;
}

/** Node moved to a new position. */
export interface NodeMoveOp {
  t: "nm";
  id: string;
  position: { x: number; y: number };
}

/** New node added (full node object). */
export interface NodeAddOp {
  t: "na";
  node: Node;
}

/** Node removed. */
export interface NodeDeleteOp {
  t: "nd";
  id: string;
}

/** New edge added (full edge object). */
export interface EdgeAddOp {
  t: "ea";
  edge: Edge;
}

/** Edge removed. */
export interface EdgeDeleteOp {
  t: "ed";
  id: string;
}

export type CollabOp =
  | NodeUpdateOp
  | NodeMoveOp
  | NodeAddOp
  | NodeDeleteOp
  | EdgeAddOp
  | EdgeDeleteOp;

/** Encode an op → deflate(msgpack(op)) → binary buffer ready for ws.send(). */
export function encodeOp(op: CollabOp): Uint8Array {
  return deflateSync(encode(op));
}

/** Decode a binary ws frame → inflate → msgpack decode → op object. */
export function decodeOp(buf: ArrayBuffer | Uint8Array): CollabOp {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return decode(inflateSync(bytes)) as CollabOp;
}
