import { getSupabase, BUCKET } from "./supabase";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join, dirname } from "path";

const useSupabase = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

async function ensureBucket() {
  const { error } = await getSupabase().storage.createBucket(BUCKET, { public: true });
  if (error && !error.message.includes("already exists")) throw new Error(error.message);
}

// storagePath should NOT include the bucket name — e.g. "projects/p_abc/123.jpg"
// Returns the relative path that was stored (not a full URL)
export async function saveFile(file: File, storagePath: string): Promise<string> {
  if (useSupabase()) {
    let { error } = await getSupabase().storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: true });
    if (error?.message.includes("Bucket not found")) {
      await ensureBucket();
      ({ error } = await getSupabase().storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType: file.type, upsert: true }));
    }
    if (error) throw new Error(error.message);
    return storagePath;
  }
  // local dev — write to public/uploads/
  const localPath = `uploads/${storagePath}`;
  const abs = join(process.cwd(), "public", localPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(await file.arrayBuffer()));
  return localPath;
}

export async function deleteFile(path: string): Promise<void> {
  if (path.startsWith("http")) {
    // Full Supabase URL — only reachable if storage is configured
    if (!useSupabase()) return;
    const marker = `/object/public/${BUCKET}/`;
    const idx = path.indexOf(marker);
    if (idx !== -1) {
      await getSupabase().storage.from(BUCKET).remove([path.slice(idx + marker.length)]);
    }
  } else if (path.startsWith("/") || path.startsWith("uploads/")) {
    const abs = path.startsWith("/") ? path : `/${path}`;
    await unlink(join(process.cwd(), "public", abs)).catch(() => {});
  } else {
    // Bare Supabase-relative path (e.g. "projects/p_abc/123.jpg").
    // If Supabase isn't configured there's nothing we can remove — skip
    // rather than throwing so the DB record can still be deleted.
    if (!useSupabase()) return;
    await getSupabase().storage.from(BUCKET).remove([path]);
  }
}
