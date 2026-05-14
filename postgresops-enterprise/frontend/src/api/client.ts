import type { ApiErrorBody } from "./types";

export async function readJsonError(r: Response): Promise<string> {
  try {
    const body = (await r.json()) as ApiErrorBody;
    const msg = body.error?.message;
    if (typeof msg === "string") return msg;
  } catch {
    /* ignore */
  }
  return r.statusText || `HTTP ${r.status}`;
}
