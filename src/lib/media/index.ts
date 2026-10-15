import "server-only";
import { imageSize } from "image-size";
import { db } from "@/lib/db";
import { deleteObject, getObject, newObjectKey, putObject, spacesConfig } from "./storage";
import { acceptedImageTypes, maxUploadBytes, mediaUrl, type MediaItem } from "./types";

// Identify the format from the file's own bytes; the browser's declared type is not trusted.
function sniff(bytes: Uint8Array): (typeof acceptedImageTypes)[number] | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (ascii(1, 4) === "PNG" && bytes[0] === 0x89) return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && /avi[fs]/.test(ascii(8, 12))) return "image/avif";
  return null;
}

export type UploadResult = { ok: true; media: MediaItem } | { ok: false; message: string };

export async function saveUpload(file: File, uploadedById: string): Promise<UploadResult> {
  if (file.size === 0) return { ok: false, message: "The file is empty." };
  if (file.size > maxUploadBytes) return { ok: false, message: "Images can be up to 5 MB." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = sniff(bytes);
  if (!mimeType) return { ok: false, message: "Upload a JPG, PNG, WebP, or AVIF image." };

  let width: number | null = null;
  let height: number | null = null;
  try {
    const size = imageSize(bytes);
    width = size.width ?? null;
    height = size.height ?? null;
  } catch {
    return { ok: false, message: "The image could not be read. Try exporting it again." };
  }

  const filename = file.name.replace(/[^\w.\- ]+/g, "").slice(0, 120) || "image";
  const details = { filename, mimeType, size: file.size, width, height, uploadedById };

  if (!spacesConfig()) {
    const row = await db.media.create({ data: { ...details, data: bytes }, select: listSelect });
    return { ok: true, media: toItem(row) };
  }

  // DigitalOcean Spaces: store the object first, then the record. If the record fails, remove the
  // object again so the bucket never collects files nothing points to.
  const storageKey = newObjectKey(mimeType);
  try {
    await putObject(storageKey, bytes, mimeType);
  } catch (error) {
    console.error("[media] Upload to DigitalOcean Spaces failed:", error instanceof Error ? error.message : error);
    return { ok: false, message: "The image could not be stored. Try again in a moment." };
  }
  try {
    const row = await db.media.create({ data: { ...details, storageKey }, select: listSelect });
    return { ok: true, media: toItem(row) };
  } catch (error) {
    await deleteObject(storageKey).catch(() => {});
    throw error;
  }
}

const listSelect = { id: true, filename: true, mimeType: true, size: true, width: true, height: true, createdAt: true } as const;

function toItem(row: { id: string; filename: string; mimeType: string; size: number; width: number | null; height: number | null; createdAt: Date }): MediaItem {
  return { ...row, url: mediaUrl(row.id), createdAt: row.createdAt.toISOString() };
}

export async function listMedia(limit = 60) {
  const rows = await db.media.findMany({ orderBy: { createdAt: "desc" }, take: limit, select: listSelect });
  return rows.map(toItem);
}

export type MediaFile = { mimeType: string; size: number | null; body: ReadableStream<Uint8Array> | Uint8Array };

/** A file's bytes for `/media/<id>`: streamed from Spaces, or read from the database. */
export async function getMediaFile(id: string): Promise<MediaFile | null> {
  const row = await db.media.findUnique({ where: { id }, select: { data: true, storageKey: true, mimeType: true, size: true } });
  if (!row) return null;
  if (row.storageKey) {
    const object = await getObject(row.storageKey);
    if (!object) {
      console.error(`[media] ${id} points to a missing object in Spaces: ${row.storageKey}`);
      return null;
    }
    return { mimeType: row.mimeType, size: object.size ?? row.size, body: object.body };
  }
  return row.data ? { mimeType: row.mimeType, size: row.size, body: row.data } : null;
}
