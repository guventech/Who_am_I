import Link from "next/link";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/copy/en";

export default function HowAccuratePage() {
  const model = getModelVersion();

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-12">
        <Link href="/" className="text-[15px]" style={{ color: "var(--accent)" }}>
          ← {copyEn.brand}
        </Link>
        <h1 className="text-[32px]" style={{ color: "var(--ink)" }}>
          {copyEn.howAccurateHeading}
        </h1>
        {copyEn.howAccurateBody.map((para) => (
          <p key={para} className="text-[17px] leading-relaxed">
            {para}
          </p>
        ))}
      </main>
    </div>
  );
}
