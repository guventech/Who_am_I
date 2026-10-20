"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8eef5",
          color: "#0f172a",
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
            The app hit an unexpected error. You can try again or return home.
          </p>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
            {error.digest ? `Ref: ${error.digest}` : null}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 6,
              border: "none",
              background: "#0f172a",
              color: "#fff",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
