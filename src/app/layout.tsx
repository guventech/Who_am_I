import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { copyEn } from "@/content/copy.en";
import "./globals.css";

const display = Libre_Baskerville({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: copyEn.brand,
  description: copyEn.promise,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col font-[family-name:var(--font-body)]"
        style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
      >
        <style>{`
          h1, h2, h3 {
            font-family: var(--font-display), Georgia, serif;
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
