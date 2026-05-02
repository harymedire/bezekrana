import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BezEkrana",
  description: "Manje ekrana, više igre. Sedmični paketi aktivnosti za djecu 2–4 godine.",
};

// next-intl renders <html> inside [locale]/layout. This top-level layout exists
// only to satisfy Next.js App Router; it must NOT render <html> itself.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
