import Link from "next/link";
import { copyEn } from "@/content/copy.en";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="font-serif text-3xl tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="text-base text-slate-700">
          That page is not part of this sketch.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-slate-800 underline-offset-4 hover:underline"
        >
          Back to {copyEn.brand}
        </Link>
      </main>
    </div>
  );
}
