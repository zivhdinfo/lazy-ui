import fs from "node:fs";
import path from "node:path";

// Server-only. Reads a component's TSX source straight from its installed
// location so what consumers receive from `/r/[slug].json` is exactly what
// lives in this repo. No in-memory cache: dev edits should reflect on the
// next request without restarting the server; the OS already caches the read.
const SRC_DIR = path.join(process.cwd(), "src");

export function getComponentSource(target: string): string {
  const filePath = path.join(SRC_DIR, target);
  return fs.readFileSync(filePath, "utf-8");
}

/** Read a registry-bundled file by its src-relative path (e.g. "lib/foo.ts"). */
export function getExtraFileSource(srcRelativePath: string): string {
  const filePath = path.join(SRC_DIR, srcRelativePath);
  return fs.readFileSync(filePath, "utf-8");
}
