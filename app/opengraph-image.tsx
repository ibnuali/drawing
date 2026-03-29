import { ImageResponse } from "next/og";

export const alt = "Xdraw - Collaborative Whiteboard";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#18181b",
          color: "#ffffff",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L9 18l6-6z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: "bold",
              letterSpacing: "-0.02em",
            }}
          >
            Xdraw
          </span>
          <span
            style={{
              fontSize: 32,
              fontWeight: 400,
              marginTop: 16,
              color: "#a1a1aa",
            }}
          >
            Collaborative Whiteboard
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 60,
            fontSize: 20,
            color: "#71717a",
          }}
        >
          <span>Sketch ideas. Collaborate in real-time. Share instantly.</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}