import Link from "next/link";
import { DeleteDataForm } from "@/components/DeleteDataForm";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/copy/en";

export default function PrivacyPage() {
  const model = getModelVersion();

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-12">
        <Link href="/" className="text-[15px]" style={{ color: "var(--accent)" }}>
          ← {copyEn.brand}
        </Link>
        <h1 className="text-[32px]" style={{ color: "var(--ink)" }}>
          {copyEn.privacyHeading}
        </h1>
        <div className="flex flex-col gap-4 text-[17px] leading-relaxed">
          {copyEn.privacyBody.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
        <details>
          <summary
            className="cursor-pointer text-[15px]"
            style={{ color: "var(--accent)" }}
          >
            {copyEn.legacyDeleteLabel}
          </summary>
          <div className="mt-4">
            <DeleteDataForm />
          </div>
        </details>
      </main>
    </div>
  );
}
