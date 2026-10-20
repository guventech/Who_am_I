"use client";

import { useState } from "react";
import { copyEn } from "@/copy/en";
import { createClientStorage } from "@/storage/client";

export function DeleteDataForm() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      id="delete"
      className="flex flex-col gap-3 scroll-mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        const adapter = createClientStorage({
          consentStore: true,
          ageConfirmed: true,
        });
        void adapter.deleteByCode(code.trim()).then((result) => {
          setMessage(result.deleted ? copyEn.deleteDone : copyEn.deleteNone);
        });
      }}
    >
      <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
        {copyEn.deleteHeading}
      </h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {copyEn.deleteHint}
      </p>
      <label className="flex flex-col gap-1 text-sm">
        {copyEn.deleteCodeLabel}
        <input
          type="text"
          autoComplete="off"
          data-testid="delete-code"
          className="h-12 rounded-[10px] border px-3 font-mono uppercase tracking-wider"
          style={{ borderColor: "var(--line)", background: "#fff" }}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </label>
      <button type="submit" className="btn-secondary">
        {copyEn.deleteSubmit}
      </button>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </form>
  );
}
