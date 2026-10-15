/** Normalize an Indonesian mobile number to 628… or return null. */
export function normalizeWhatsapp(input: string) {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (normalized.startsWith("0")) normalized = `62${normalized.slice(1)}`;
  else if (!normalized.startsWith("62")) normalized = `62${normalized}`;

  if (!/^628\d{7,12}$/.test(normalized)) return null;
  return normalized;
}

/** A normalized number for people to read: 6281234567890 -> +62 812-3456-7890. */
export function formatWhatsapp(number: string) {
  const local = number.replace(/^62/, "");
  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
}
