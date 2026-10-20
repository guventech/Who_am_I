import Link from "next/link";
import { DeleteDataForm } from "@/components/DeleteDataForm";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/content/copy.en";

export default function PrivacyPage() {
  const model = getModelVersion();

  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
        >
          ← {copyEn.brand}
        </Link>
        <h1 className="font-serif text-3xl tracking-tight text-slate-900">
          {copyEn.privacyHeading}
        </h1>
        <div className="flex flex-col gap-4 text-base leading-relaxed text-slate-700">
          {copyEn.privacyBody.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          {copyEn.ipipAttribution}
        </p>
        <DeleteDataForm />
      </main>
    </div>
  );
}
