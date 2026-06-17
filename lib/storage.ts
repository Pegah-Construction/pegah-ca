import { supabase, BUCKET } from "./supabase";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join, dirname } from "path";

const useSupabase = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

async function ensureBucket() {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  // "already exists" is fine — any other error is real
  if (error && !error.message.includes("already exists")) throw new Error(error.message);
}

export async function saveFile(file: File, storagePath: string): Promise<string> {
  if (useSupabase()) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: true });
    if (error?.message.includes("Bucket not found")) {
      await ensureBucket();
      const { error: e2 } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType: file.type, upsert: true });
      if (e2) throw new Error(e2.message);
    } else if (error) {
      throw new Error(error.message);
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  }
  // local dev fallback — write to public/
  const abs = join(process.cwd(), "public", storagePath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(await file.arrayBuffer()));
  return `/${storagePath}`;
}

export async function deleteFile(path: string): Promise<void> {
  if (path.startsWith("http")) {
    // Extract the storage path from the Supabase public URL
    const marker = `/object/public/${BUCKET}/`;
    const idx = path.indexOf(marker);
    if (idx !== -1) {
      const storagePath = path.slice(idx + marker.length);
      await supabase.storage.from(BUCKET).remove([storagePath]);
    }
  } else {
    // local dev — remove from public/
    await unlink(join(process.cwd(), "public", path)).catch(() => {});
  }
}
