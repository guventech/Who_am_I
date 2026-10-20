"use client";

import { useState } from "react";
import { copyEn } from "@/content/copy.en";
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
          setMessage(
            result.deleted ? copyEn.deleteDone : copyEn.deleteNone,
          );
        });
      }}
    >
      <h2 className="font-serif text-xl text-slate-900">{copyEn.deleteHeading}</h2>
      <p className="text-sm text-slate-600">{copyEn.deleteHint}</p>
      <label className="flex flex-col gap-1 text-sm text-slate-800">
        {copyEn.deleteCodeLabel}
        <input
          type="text"
          autoComplete="off"
          data-testid="delete-code"
          className="h-10 rounded-md border border-slate-300 bg-white px-3 font-mono uppercase tracking-wider"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-md border border-slate-500 bg-white px-4 text-sm font-medium text-slate-900"
      >
        {copyEn.deleteSubmit}
      </button>
      {message ? (
        <p role="status" className="text-sm text-slate-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}
