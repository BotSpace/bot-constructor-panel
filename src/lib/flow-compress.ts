/**
 * Flow gzip + base64 compression helpers.
 *
 * Uses fflate (already a dependency — wss/collab/ops.ts).
 * Convention (backend kontrakt):
 *   flow_gz = base64(gzip(JSON.stringify(flow)))
 */
import { gzipSync, gunzipSync, strToU8, strFromU8 } from "fflate";

/** base64 string → Uint8Array */
function base64ToU8(b64: string): Uint8Array {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    u8[i] = bin.charCodeAt(i);
  }
  return u8;
}

/** Uint8Array → base64 string */
function u8ToBase64(u8: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < u8.length; i++) {
    bin += String.fromCharCode(u8[i]);
  }
  return btoa(bin);
}

/**
 * Compress a flow object to base64-encoded gzip string.
 * Throws if JSON.stringify fails (circular refs etc.).
 */
export function compressFlow(flow: object): string {
  const json = JSON.stringify(flow);
  const compressed = gzipSync(strToU8(json));
  return u8ToBase64(compressed);
}

/**
 * Decompress a flow_gz string back to a plain object.
 * Returns null on any error (caller should fall back to plain flow).
 */
export function decompressFlow(flow_gz: string): object | null {
  try {
    const u8 = base64ToU8(flow_gz);
    const decompressed = gunzipSync(u8);
    const json = strFromU8(decompressed);
    return JSON.parse(json);
  } catch (err) {
    console.error("[flow-compress] decompressFlow xatolik:", err);
    return null;
  }
}
