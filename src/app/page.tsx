import Link from "next/link";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { StartButton } from "@/components/StartButton";
import { isStorageEnabled } from "@/config/storage-enabled";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/copy/en";

export default function Home() {
  const model = getModelVersion();
  const storageEnabled = isStorageEnabled();

  return (
    <div className="flex w-full flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main
        data-testid="content-column"
        className="page flex flex-1 flex-col justify-center gap-6 py-12"
      >
        <h1
          className="text-[32px] leading-tight tracking-tight sm:text-4xl"
          style={{ color: "var(--ink)" }}
        >
          {copyEn.brand}
        </h1>
        <p className="text-[17px] leading-relaxed" style={{ color: "var(--ink)" }}>
          {copyEn.promise}
        </p>
        <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
          {copyEn.youGet}
        </p>
        <p className="text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
          {copyEn.landingExpectation}
        </p>
        <StartButton />
        {storageEnabled ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {copyEn.nothingSavedUnless}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-4 text-[15px]">
          <Link
            href="/how-accurate"
            className="underline-offset-4 hover:underline"
            style={{ color: "var(--accent)" }}
          >
            {copyEn.howAccurateLink}
          </Link>
          <Link
            href="/privacy"
            className="underline-offset-4 hover:underline"
            style={{ color: "var(--accent)" }}
          >
            {copyEn.privacyLink}
          </Link>
        </div>
      </main>
    </div>
  );
}
