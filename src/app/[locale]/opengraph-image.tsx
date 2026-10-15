import { getSettings } from "@/lib/content";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const settings = getSettings();
  const name = settings.companyName;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#253CA1",
          color: "white",
          padding: 72,
        }}
      >
        <div style={{ fontSize: 28, color: "#929499" }}>Medan</div>
        <div style={{ fontSize: 68, marginTop: 16, lineHeight: 1.1 }}>{name}</div>
      </div>
    ),
    size,
  );
}
