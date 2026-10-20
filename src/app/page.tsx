import Link from "next/link";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { StartButton } from "@/components/StartButton";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/copy/en";

export default function Home() {
  const model = getModelVersion();

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center gap-6 px-5 py-12">
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
        <StartButton />
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {copyEn.nothingSavedUnless}
        </p>
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
