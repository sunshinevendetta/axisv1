"use client";

export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999,
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "2px 8px",
          fontSize: "4px",
          letterSpacing: "0.08em",
          color: "#fff",
          textTransform: "uppercase",
          border: "1px solid #fff",
          background: "transparent"
        }}
      >
        SPECTRA® {new Date().getFullYear()}
      </div>
    </footer>
  );
}
