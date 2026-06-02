"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ margin: 0, background: "#000", color: "#fff" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "32px",
            textAlign: "center",
            fontFamily: "var(--font-body), sans-serif",
          }}
        >
          <div>
            <p style={{ margin: 0, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.6 }}>
              AXIS
            </p>
            <h1 style={{ margin: "16px 0 8px", fontSize: "clamp(2rem, 6vw, 5rem)", lineHeight: 0.95 }}>
              Internal Server Error
            </h1>
            <p style={{ margin: 0, opacity: 0.75 }}>Something went wrong while rendering this page.</p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: "24px",
                padding: "10px 20px",
                background: "#fff",
                color: "#000",
                border: 0,
                borderRadius: "999px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
