// Root not-found.tsx must include <html> + <body> because the root layout
// (src/app/layout.tsx) intentionally returns just `{children}` so the
// per-locale layout under [locale]/ can own the html element.
//
// We force this page dynamic so Next.js never tries to statically prerender
// /404 — that prerender path was triggering an `<Html> should not be
// imported outside pages/_document` error during Railway builds.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <html lang="bs">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#FFF9F2",
          color: "#291D3B",
        }}
      >
        <main
          style={{
            maxWidth: 480,
            margin: "10vh auto",
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 64, margin: 0 }}>404</h1>
          <p>Stranica nije pronađena.</p>
          <a
            href="/"
            style={{ color: "#FF6B6B", fontWeight: 700, textDecoration: "none" }}
          >
            Početna →
          </a>
        </main>
      </body>
    </html>
  );
}
