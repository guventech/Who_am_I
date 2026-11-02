import Link from "next/link";
import { FeedbackAccess } from "@/components/FeedbackAccess";
import { copyEn } from "@/copy/en";

export default function FeedbackPage() {
  return (
    <main className="page flex-1 py-10">
      <Link href="/" className="text-[15px]" style={{ color: "var(--accent)" }}>
        {copyEn.feedbackReturn}
      </Link>
      <h1 className="mt-6 text-[32px]">{copyEn.feedbackSend}</h1>
      <p className="mt-3 mb-6" style={{ color: "var(--muted)" }}>
        {copyEn.feedbackFormIntro}
      </p>
      <FeedbackAccess />
      <Link
        href="/privacy"
        className="mt-6 inline-block text-[15px]"
        style={{ color: "var(--accent)" }}
      >
        {copyEn.privacyLink}
      </Link>
    </main>
  );
}
