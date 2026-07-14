import { put, del } from "@vercel/blob";
import { writeFile, mkdir, unlink, readFile } from "fs/promises";
import { join, dirname, extname } from "path";

// Storage backend: Vercel Blob when configured, otherwise local disk (dev only).
const useVercelBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

const isBlobUrl = (path: string) => path.includes(".blob.vercel-storage.com");

const MEDIA_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".csv": "text/csv",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function mediaTypeFor(path: string): string {
  return MEDIA_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Reads a stored file's raw bytes. Returns null (never throws) when the file
 * can't be reached — e.g. a legacy path with no backing file — so callers can
 * skip it gracefully.
 */
export async function readFileBytes(path: string): Promise<Buffer | null> {
  try {
    if (path.startsWith("http")) {
      const res = await fetch(path);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    }
    if (path.startsWith("/") || path.startsWith("uploads/")) {
      const abs = path.startsWith("/") ? path : `/${path}`;
      return await readFile(join(process.cwd(), "public", abs));
    }
    // Legacy relative path with no reachable backing store.
    return null;
  } catch {
    return null;
  }
}

// storagePath should NOT include the bucket name — e.g. "projects/p_abc/123.jpg"
// Returns what's stored in the DB: a full URL for Vercel Blob, or a relative
// "uploads/…" path for local dev.
export async function saveFile(file: File, storagePath: string): Promise<string> {
  if (useVercelBlob()) {
    // Bound the upload so a misconfigured/unreachable store can never hang the
    // request (which would tie up the server and stall other actions).
    const { url } = await put(storagePath, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: true,
      abortSignal: AbortSignal.timeout(25000),
    });
    return url;
  }
  // local dev — write to public/uploads/
  const localPath = `uploads/${storagePath}`;
  const abs = join(process.cwd(), "public", localPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, new Uint8Array(await file.arrayBuffer()));
  return localPath;
}

export async function deleteFile(path: string): Promise<void> {
  if (!path) return;
  if (isBlobUrl(path)) {
    // Vercel Blob public URL — del() reads BLOB_READ_WRITE_TOKEN from env.
    if (!useVercelBlob()) return;
    await del(path);
    return;
  }
  if (path.startsWith("/") || path.startsWith("uploads/")) {
    const abs = path.startsWith("/") ? path : `/${path}`;
    await unlink(join(process.cwd(), "public", abs)).catch(() => {});
    return;
  }
  // Anything else (external URLs, legacy relative paths) has no reachable
  // backing store — nothing to delete, so no-op rather than throwing.
}
