import type { Metadata } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/copy/en";
import { env } from "@/config/env";
import { assertReleaseReady } from "@/config/release-readiness";
import { insightLibraryV1 } from "@/insights/library";
import "./globals.css";

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const model = getModelVersion();
const uncalibrated = model.bankStatus !== "calibrated";

export const metadata: Metadata = {
  title: `${copyEn.brand} | Bircans`,
  description: copyEn.promise,
  applicationName: copyEn.brand,
  icons: {
    icon: [{ url: "/bircans-icon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/bircans-apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  authors: [{ name: "Guven Bircan", url: "https://bircans.com" }],
  openGraph: {
    title: `${copyEn.brand} | Bircans`,
    description: `${copyEn.landingExpectation} ${copyEn.promise}`,
    siteName: "Bircans",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: `${copyEn.brand} | Bircans`,
    description: copyEn.landingExpectation,
  },
  /** noindex while the bank is uncalibrated (brief §4 / Phase 6). */
  robots: uncalibrated ? { index: false, follow: false } : { index: true, follow: true },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  assertReleaseReady(
    model,
    env,
    insightLibraryV1.some((entry) => entry.reviewStatus === "draft"),
  );
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body
        className="flex min-h-full flex-col font-[family-name:var(--font-body)]"
        style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
      >
        {children}
        <footer
          className="border-t px-5 py-5 text-sm"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          <div className="page flex flex-wrap items-center justify-between gap-3">
            <span>{copyEn.brandAttribution}</span>
            <a
              href="https://bircans.com"
              style={{ color: "var(--accent)" }}
              className="underline-offset-4 hover:underline"
            >
              {copyEn.brandReturn}
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
