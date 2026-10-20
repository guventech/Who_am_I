import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { getModelVersion } from "@/content/client-content";
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

const model = getModelVersion();
const uncalibrated = model.bankStatus !== "calibrated";

export const metadata: Metadata = {
  title: copyEn.brand,
  description: copyEn.promise,
  /** noindex while the bank is uncalibrated (brief §4 / Phase 6). */
  robots: uncalibrated
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col font-[family-name:var(--font-body)]"
        style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
