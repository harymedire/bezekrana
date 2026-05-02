import { Link } from "@/lib/i18n/navigation";

// Per-locale 404. The parent [locale]/layout.tsx already renders <html>
// and <body>, so this page only emits the visible content. Keeping the
// root src/app/not-found.tsx as a tiny non-html fallback prevents the
// Next.js 15 static-generation error around <Html> imports.
export default function LocaleNotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-6 bg-cream">
      <div className="text-center max-w-md">
        <h1 className="font-display text-7xl text-coral-500 mb-4">404</h1>
        <p className="text-plum-700 text-lg mb-6">
          Stranica nije pronađena.
        </p>
        <Link
          href="/"
          className="inline-flex items-center font-bold text-coral-600 hover:underline"
        >
          ← Vrati se na početnu
        </Link>
      </div>
    </main>
  );
}
