import { afterEach, describe, expect, it, vi } from "vitest";

describe("POST /api/storage/complete", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns 503 when storage is off in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CONVEX_URL", "");
    vi.stubEnv("CONVEX_SERVER_KEY", "");
    vi.stubEnv("SESSION_CODE_PEPPER", "");

    const { POST } = await import("@/app/api/storage/complete/route");
    const res = await POST(
      new Request("http://localhost/api/storage/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          consentStore: true,
          ageConfirmed: true,
        }),
      }),
    );
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("storage_unavailable");
  });
});
