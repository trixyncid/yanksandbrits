import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { leadAlert, manualAlertHref } from "../../src/lib/leads/alert";
import { filtersQuery, parseLeadFilters, UNASSIGNED } from "../../src/lib/leads/filters";

// The gateway module is server-only; outside Next.js that guard would throw on import.
mock.module("server-only", () => ({}));
const { gatewayStatus, sendWhatsapp, GatewayError } = await import("../../src/lib/whatsapp/gateway");

describe("counsellor alert", () => {
  const lead = { name: "Sari Wulandari", whatsapp: "6281234567890", programs: ["IELTS", "TOEFL"], channel: "Paid social" };

  test("lists each lead with a tap-to-chat link", () => {
    const text = leadAlert({ counsellor: "Ayu Lestari", leads: [lead, { ...lead, name: "Budi", whatsapp: "6281300000000", programs: ["HSK"], channel: "Direct" }], assignedBy: "Winsten" });
    expect(text).toStartWith("Hi Ayu, 2 new leads have been assigned to you.");
    expect(text).toContain("1. *Sari Wulandari*\n   IELTS, TOEFL · Paid social\n   +62 812-3456-7890 · https://wa.me/6281234567890");
    expect(text).toContain("2. *Budi*");
    expect(text).toContain("Please contact each of them within one business day.");
    expect(text).toEndWith("Assigned by Winsten · Yanks and Brits CMS");
  });

  test("reads naturally for one lead and caps long lists", () => {
    expect(leadAlert({ counsellor: "Ayu", leads: [lead], assignedBy: "W" })).toContain("a new lead has been assigned");
    const many = leadAlert({ counsellor: "Ayu", leads: Array.from({ length: 18 }, (_, i) => ({ ...lead, name: `Lead ${i + 1}` })), assignedBy: "W" });
    expect(many).toContain("15. *Lead 15*");
    expect(many).not.toContain("Lead 16");
    expect(many).toContain("…and 3 more.");
  });

  test("manual fallback opens the counsellor's chat with the text ready", () => {
    expect(manualAlertHref("6281100000000", "Hi Ayu & co")).toBe("https://wa.me/6281100000000?text=Hi%20Ayu%20%26%20co");
  });
});

describe("lead filters in the URL", () => {
  test("multi-value column filters round-trip", () => {
    const filters = parseLeadFilters({ channel: "Paid social,Organic search", counsellor: `${UNASSIGNED},clx1a2b3c4d5e6f7g8h9`, program: "ielts,toefl", sort: "oldest", range: "90" });
    expect(filters.channel).toEqual(["Paid social", "Organic search"]);
    expect(filters.counsellor).toEqual([UNASSIGNED, "clx1a2b3c4d5e6f7g8h9"]);
    expect(parseLeadFilters(Object.fromEntries(new URLSearchParams(filtersQuery(filters).slice(1))))).toEqual(filters);
  });

  test("drops values that cannot be real", () => {
    const filters = parseLeadFilters({ channel: "Paid social,<script>", origin: "contact,fax", counsellor: "x;drop", sort: "random", program: "../etc" });
    expect(filters).toMatchObject({ channel: ["Paid social"], origin: ["contact"], counsellor: [], sort: "newest", program: [] });
    expect(filtersQuery(parseLeadFilters({}))).toBe("");
  });
});

describe("WhatsApp gateway (GOWA)", () => {
  const realFetch = globalThis.fetch;
  let calls: { url: string; init: RequestInit }[] = [];
  const respond = (status: number, body: unknown) => {
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
    }) as typeof fetch;
  };

  beforeEach(() => {
    calls = [];
    process.env.WA_GATEWAY_URL = "http://gateway.test:3000/";
    process.env.WA_GATEWAY_USERNAME = "cms";
    process.env.WA_GATEWAY_PASSWORD = "secret";
    process.env.WA_GATEWAY_DEVICE_ID = "admissions";
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    for (const key of ["WA_GATEWAY_URL", "WA_GATEWAY_USERNAME", "WA_GATEWAY_PASSWORD", "WA_GATEWAY_DEVICE_ID"]) delete process.env[key];
  });

  test("sends a text in GOWA's format", async () => {
    respond(200, { code: "SUCCESS", message: "Success", results: { message_id: "3EB0B430", status: "Message sent" } });
    expect(await sendWhatsapp("6281100000000", "Hello")).toEqual({ messageId: "3EB0B430" });
    const [{ url, init }] = calls;
    expect(url).toBe("http://gateway.test:3000/send/message");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ phone: "6281100000000@s.whatsapp.net", message: "Hello" });
    const headers = new Headers(init.headers);
    expect(headers.get("authorization")).toBe(`Basic ${Buffer.from("cms:secret").toString("base64")}`);
    expect(headers.get("x-device-id")).toBe("admissions");
  });

  test("explains each way a send can fail", async () => {
    const reason = async () => {
      try {
        await sendWhatsapp("6281100000000", "Hello");
      } catch (error) {
        return error instanceof GatewayError ? error.reason : "other";
      }
      return "sent";
    };
    respond(500, { code: "INTERNAL_SERVER_ERROR", message: "you are not loggin", results: null });
    expect(await reason()).toBe("logged-out");
    respond(401, {});
    expect(await reason()).toBe("unauthorized");
    respond(400, { code: 400, message: "phone: cannot be blank", results: null });
    expect(await reason()).toBe("rejected");
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    expect(await reason()).toBe("unreachable");
    delete process.env.WA_GATEWAY_URL;
    expect(await reason()).toBe("not-configured");
  });

  test("reports status for the CMS", async () => {
    respond(200, { code: "SUCCESS", message: "Connection status retrieved", results: { is_connected: true, is_logged_in: true } });
    expect(await gatewayStatus()).toEqual({ state: "connected" });
    respond(200, { code: "SUCCESS", results: { is_connected: true, is_logged_in: false } });
    expect((await gatewayStatus()).state).toBe("problem");
    delete process.env.WA_GATEWAY_URL;
    expect(await gatewayStatus()).toEqual({ state: "not-configured" });
  });
});
