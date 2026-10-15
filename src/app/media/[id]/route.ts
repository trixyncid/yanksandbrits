import { getMediaFile } from "@/lib/media";

// Uploaded files never change under the same id, so browsers and CDNs may keep them for a year.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{20,40}$/.test(id)) return new Response("Not found", { status: 404 });
  const file = await getMediaFile(id);
  if (!file) return new Response("Not found", { status: 404 });
  // Files in DigitalOcean Spaces stream straight through; database files are sent as one buffer.
  const body = file.body instanceof ReadableStream ? file.body : Buffer.from(file.body);
  return new Response(body, {
    headers: {
      "Content-Type": file.mimeType,
      ...(file.size === null ? {} : { "Content-Length": String(file.size) }),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
