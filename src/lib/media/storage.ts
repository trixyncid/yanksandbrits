import "server-only";
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Where uploaded files live: DigitalOcean Spaces (S3-compatible) when it is configured, otherwise the
 * `media.data` column, so local development and CI work without a bucket.
 *
 * Objects are private. Visitors always fetch `/media/<id>`, which streams the object from Spaces, so
 * stored URLs, the security policy, and image optimisation do not change with the storage.
 */

const env = {
  key: "DO_SPACES_KEY",
  secret: "DO_SPACES_SECRET",
  bucket: "DO_SPACES_BUCKET",
  region: "DO_SPACES_REGION",
} as const;

export type SpacesConfig = { key: string; secret: string; bucket: string; region: string; endpoint: string; folder: string };

/** Spaces settings, `null` when none are set. Throws when only some are, so a typo never silently falls back. */
export function spacesConfig(): SpacesConfig | null {
  const values = Object.fromEntries(Object.entries(env).map(([name, variable]) => [name, process.env[variable]?.trim() ?? ""])) as Record<keyof typeof env, string>;
  const missing = Object.entries(env)
    .filter(([name]) => !values[name as keyof typeof env])
    .map(([, variable]) => variable);
  if (missing.length === Object.keys(env).length) return null;
  if (missing.length) throw new Error(`DigitalOcean Spaces is partly configured. Set ${missing.join(", ")} or remove the other DO_SPACES_ variables.`);
  return {
    ...values,
    // e.g. sgp1 -> https://sgp1.digitaloceanspaces.com
    endpoint: process.env.DO_SPACES_ENDPOINT?.trim() || `https://${values.region}.digitaloceanspaces.com`,
    // A prefix inside the bucket, so several environments can share one Space.
    folder: (process.env.DO_SPACES_FOLDER?.trim() || "media").replace(/^\/+|\/+$/g, ""),
  };
}

let client: { config: SpacesConfig; s3: S3Client } | null = null;

function spaces() {
  const config = spacesConfig();
  if (!config) throw new Error("DigitalOcean Spaces is not configured.");
  if (!client || client.config.endpoint !== config.endpoint || client.config.key !== config.key) {
    client = {
      config,
      s3: new S3Client({
        endpoint: config.endpoint,
        // Spaces ignores the SDK region; DigitalOcean's docs use us-east-1 with a regional endpoint.
        region: "us-east-1",
        forcePathStyle: false,
        credentials: { accessKeyId: config.key, secretAccessKey: config.secret },
        // Newer SDKs send CRC checksums on every request by default, which S3-compatible services
        // do not all accept. Only send them when an operation requires it.
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
      }),
    };
  }
  return client;
}

const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

/** A new, unguessable object key, grouped by month: `media/2026/10/<uuid>.jpg`. */
export function newObjectKey(mimeType: string, now = new Date()) {
  const { config } = spaces();
  const month = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${config.folder}/${month}/${crypto.randomUUID().replace(/-/g, "")}.${extensions[mimeType] ?? "bin"}`;
}

export async function putObject(key: string, bytes: Uint8Array, mimeType: string) {
  const { config, s3 } = spaces();
  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: bytes,
      ContentType: mimeType,
      ContentLength: bytes.byteLength,
      ACL: "private",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

/** The object's body as a web stream, or `null` if it is not there. */
export async function getObject(key: string): Promise<{ body: ReadableStream<Uint8Array>; size: number | null } | null> {
  const { config, s3 } = spaces();
  try {
    const result = await s3.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
    if (!result.Body) return null;
    return { body: result.Body.transformToWebStream(), size: result.ContentLength ?? null };
  } catch (error) {
    if (error instanceof Error && (error.name === "NoSuchKey" || error.name === "NotFound")) return null;
    throw error;
  }
}

/** The stored size in bytes, or `null` if the object is not there. Used to verify copies. */
export async function objectSize(key: string): Promise<number | null> {
  const { config, s3 } = spaces();
  try {
    const result = await s3.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
    return result.ContentLength ?? null;
  } catch (error) {
    if (error instanceof Error && (error.name === "NotFound" || error.name === "NoSuchKey")) return null;
    throw error;
  }
}

export async function deleteObject(key: string) {
  const { config, s3 } = spaces();
  await s3.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}
