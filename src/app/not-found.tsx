import Link from "next/link";
import { copyEn } from "@/copy/en";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center gap-4 px-5 py-16">
        <h1 className="text-[32px]" style={{ color: "var(--ink)" }}>
          {copyEn.notFoundHeading}
        </h1>
        <p style={{ color: "var(--ink)" }}>{copyEn.notFoundBody}</p>
        <Link href="/" className="btn-primary">
          {copyEn.notFoundHome}
        </Link>
      </main>
    </div>
  );
}
