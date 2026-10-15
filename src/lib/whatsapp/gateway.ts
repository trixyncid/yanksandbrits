import "server-only";

// Sends WhatsApp messages through a self-hosted GOWA gateway (github.com/aldinokemal/go-whatsapp-web-multidevice,
// MIT). It links an ordinary WhatsApp number like WhatsApp Web does, so use a dedicated business number.
// Setup: docs/whatsapp-gateway.md.

type Config = { url: string; auth: string | null; deviceId: string | null };

function config(): Config | null {
  const url = process.env.WA_GATEWAY_URL?.trim().replace(/\/+$/, "");
  if (!url) return null;
  const user = process.env.WA_GATEWAY_USERNAME?.trim();
  const password = process.env.WA_GATEWAY_PASSWORD?.trim();
  return {
    url,
    auth: user && password ? `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}` : null,
    deviceId: process.env.WA_GATEWAY_DEVICE_ID?.trim() || null,
  };
}

export const gatewayConfigured = () => config() !== null;

type GatewayBody = { code?: string | number; message?: string; results?: Record<string, unknown> | null };

async function call(path: string, init: RequestInit & { timeout?: number } = {}) {
  const settings = config();
  if (!settings) throw new GatewayError("not-configured", "WhatsApp alerts are not set up.");
  const headers = new Headers(init.headers);
  if (settings.auth) headers.set("authorization", settings.auth);
  if (settings.deviceId) headers.set("x-device-id", settings.deviceId);
  let response: Response;
  try {
    response = await fetch(`${settings.url}${path}`, { ...init, headers, signal: AbortSignal.timeout(init.timeout ?? 10_000), cache: "no-store" });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new GatewayError("unreachable", timedOut ? "The WhatsApp gateway did not answer in time." : "The WhatsApp gateway could not be reached.");
  }
  const body = (await response.json().catch(() => ({}))) as GatewayBody;
  if (response.status === 401) throw new GatewayError("unauthorized", "The WhatsApp gateway rejected the username or password.");
  if (!response.ok || (body.code !== undefined && body.code !== "SUCCESS")) {
    const detail = String(body.message ?? `HTTP ${response.status}`);
    // GOWA answers "you are not loggin" (sic) while no phone is linked.
    if (/not log/i.test(detail)) throw new GatewayError("logged-out", "The WhatsApp number is not linked to the gateway. Scan the QR code again.");
    throw new GatewayError("rejected", `The WhatsApp gateway refused the message: ${detail.slice(0, 160)}`);
  }
  return body;
}

export class GatewayError extends Error {
  constructor(
    readonly reason: "not-configured" | "unreachable" | "unauthorized" | "logged-out" | "rejected",
    message: string,
  ) {
    super(message);
  }
}

/** Sends a text message. `phone` is a normalized number (628…). Returns the gateway's message id. */
export async function sendWhatsapp(phone: string, text: string) {
  const body = await call("/send/message", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone: `${phone}@s.whatsapp.net`, message: text }),
  });
  return { messageId: typeof body.results?.message_id === "string" ? body.results.message_id : null };
}

export type GatewayStatus = { state: "not-configured" } | { state: "connected" } | { state: "problem"; message: string };

/** For the CMS: whether alerts can go out right now. Short timeout, so a dead gateway never slows the page. */
export async function gatewayStatus(): Promise<GatewayStatus> {
  if (!gatewayConfigured()) return { state: "not-configured" };
  try {
    const body = await call("/app/status", { timeout: 3_000 });
    const results = body.results ?? {};
    if (results.is_connected === false || results.is_logged_in === false) return { state: "problem", message: "The WhatsApp number is not linked to the gateway. Scan the QR code again." };
    return { state: "connected" };
  } catch (error) {
    return { state: "problem", message: error instanceof GatewayError ? error.message : "The WhatsApp gateway could not be checked." };
  }
}
