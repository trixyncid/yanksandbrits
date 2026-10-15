import { z } from "zod";

export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

export const emptyDoc: DocNode = { type: "doc", content: [{ type: "paragraph" }] };

const markSchema = z.object({
  type: z.string().min(1).max(40),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

export const docNodeSchema: z.ZodType<DocNode> = z.lazy(() =>
  z.object({
    type: z.string().min(1).max(40),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(docNodeSchema).max(5000).optional(),
    marks: z.array(markSchema).max(20).optional(),
    text: z.string().max(100_000).optional(),
  }),
);

const safeLink = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const safeImage = /^(https?:\/\/|\/)/i;

export function isSafeHref(value: unknown) {
  return typeof value === "string" && safeLink.test(value.trim());
}

export function isSafeImageSrc(value: unknown) {
  return typeof value === "string" && safeImage.test(value.trim());
}

// The editor already validates links, but the server never trusts the client's JSON.
export function sanitizeDoc(node: DocNode): DocNode | null {
  if (node.type === "image" && !isSafeImageSrc(node.attrs?.src)) return null;
  const marks = node.marks?.filter((mark) => mark.type !== "link" || isSafeHref(mark.attrs?.href));
  const content = node.content?.map(sanitizeDoc).filter((child): child is DocNode => child !== null);
  return {
    ...node,
    ...(marks ? { marks } : {}),
    ...(content ? { content } : {}),
  };
}

export function docText(node: DocNode): string {
  if (node.type === "text") return node.text ?? "";
  const inner = (node.content ?? []).map(docText).join(node.type === "doc" ? "\n" : " ");
  return inner.replace(/[ \t]+/g, " ");
}

export function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

// About 200 words a minute, never less than one minute.
export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 200));
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
