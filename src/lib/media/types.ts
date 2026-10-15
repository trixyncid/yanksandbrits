export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export const maxUploadBytes = 5 * 1024 * 1024;
export const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

export function mediaUrl(id: string) {
  return `/media/${id}`;
}

/** Site images (`/images/...`), uploaded media (`/media/...`), or sponsor files (`/sponsors/...`). */
export function isSiteImage(value: string) {
  return /^\/(images|media|sponsors)\/[\w./-]+$/.test(value);
}
