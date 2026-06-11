import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Hayattan.Net";
  const author = searchParams.get("author") ?? "";
  const category = searchParams.get("category") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f0f0f",
          padding: "60px",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: "#8b1538",
          }}
        />

        {/* Category badge */}
        {category && (
          <div
            style={{
              backgroundColor: "#8b1538",
              color: "white",
              padding: "6px 18px",
              borderRadius: 4,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              alignSelf: "flex-start",
              marginBottom: 32,
            }}
          >
            {category}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? 48 : 60,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.25,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 40,
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#8b1538",
              letterSpacing: "-0.02em",
            }}
          >
            Hayattan.Net
          </div>
          {author && (
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {author}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
