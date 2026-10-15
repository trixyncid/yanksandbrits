// Shared by the site and the CMS editor's live preview.

export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

/** "+1.5" for numeric scores ("5.5" -> "7.0"), keeping the precision of the inputs. */
export function scoreGain(before: string, after: string) {
  const from = Number(before.replace(",", "."));
  const to = Number(after.replace(",", "."));
  if (!before || !after || !Number.isFinite(from) || !Number.isFinite(to) || to === from) return null;
  const decimals = Math.max(before.split(/[.,]/)[1]?.length ?? 0, after.split(/[.,]/)[1]?.length ?? 0);
  const gain = (to - from).toFixed(decimals);
  return to > from ? `+${gain}` : gain;
}
