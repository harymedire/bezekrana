import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="bs">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FFF9F2", color: "#291D3B" }}>
        <main style={{ maxWidth: 480, margin: "10vh auto", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 64, margin: 0 }}>404</h1>
          <p>Stranica nije pronađena.</p>
          <Link href="/" style={{ color: "#FF6B6B", fontWeight: 700 }}>Početna →</Link>
        </main>
      </body>
    </html>
  );
}
