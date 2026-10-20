import Link from "next/link";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { StartButton } from "@/components/StartButton";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/content/copy.en";

export default function Home() {
  const model = getModelVersion();

  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
            {copyEn.brand}
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-slate-900 sm:text-5xl">
            {copyEn.brand}
          </h1>
          <p className="text-lg leading-relaxed text-slate-700">
            {copyEn.promise}
          </p>
          <p className="text-base text-slate-600">{copyEn.honesty}</p>
        </div>

        <div className="flex flex-col gap-3">
          <StartButton />
          <Link
            href="/how-accurate"
            className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          >
            {copyEn.howAccurateLink}
          </Link>
          <p className="text-sm text-slate-500">{copyEn.homeToTest}</p>
        </div>
      </main>
    </div>
  );
}
