import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Hayattan.Net";
  const author = searchParams.get("author") ?? "";
  const category = searchParams.get("category") ?? "";

  // Uzun başlıkları kısalt
  const displayTitle = title.length > 85 ? `${title.slice(0, 82)}...` : title;
  const fontSize = displayTitle.length > 65 ? 44 : displayTitle.length > 40 ? 52 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #0d0618 0%, #1a0a2e 40%, #0f3460 100%)",
          padding: "60px",
          fontFamily: "Georgia, Times New Roman, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Arka plan dekorasyon - büyük daire */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(180,60,100,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "100px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(60,100,200,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Üst aksan çizgisi */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #8b1538 0%, #c9335c 50%, #8b1538 100%)",
          }}
        />

        {/* Logo alanı */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", zIndex: 1 }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #8b1538, #c9335c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(139,21,56,0.4)",
            }}
          >
            <span style={{ color: "white", fontSize: "26px", fontWeight: "bold" }}>H</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", letterSpacing: "0.04em" }}>
              Hayattan.Net
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" as const }}>
              Hayatın Engelsiz Tarafı
            </span>
          </div>
        </div>

        {/* Kategori badge */}
        {category && (
          <div style={{ display: "flex", zIndex: 1 }}>
            <div
              style={{
                background: "rgba(139,21,56,0.25)",
                border: "1px solid rgba(139,21,56,0.6)",
                borderRadius: "6px",
                padding: "5px 14px",
                color: "#e85d8a",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                marginTop: "-20px",
              }}
            >
              {category}
            </div>
          </div>
        )}

        {/* Ana Başlık */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            zIndex: 1,
            padding: category ? "10px 0" : "30px 0",
          }}
        >
          <div
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: "bold",
              color: "#ffffff",
              lineHeight: 1.3,
              maxWidth: "1050px",
              textShadow: "0 2px 30px rgba(0,0,0,0.6)",
              letterSpacing: "-0.01em",
            }}
          >
            {displayTitle}
          </div>
        </div>

        {/* Alt Bar - Yazar + dekor */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {author ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b1538, #c9335c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 10px rgba(139,21,56,0.4)",
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Yazar</span>
                <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: "500" }}>{author}</span>
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Sağ taraf — nokta desen */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {[1, 0.5, 0.25].map((opacity, i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: `rgba(201,51,92,${opacity})`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
