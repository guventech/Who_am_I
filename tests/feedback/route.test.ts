import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/feedback/route";
import { copyEn } from "@/copy/en";

const { allowed } = vi.hoisted(() => ({ allowed: vi.fn(() => true) }));
vi.mock("@/storage/rate-limit", () => ({
  allowRoutedRequest: allowed,
  hmacBucketFromRequest: () => "trusted-daily-network-hash",
}));
let provider: ReturnType<typeof vi.fn>;

function payload() {
  return {
    submissionId: crypto.randomUUID(),
    topic: "bug",
    comment: "The back button is hard to find.",
    email: "visitor@example.org",
    website: "",
  };
}
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://whoami.example/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://whoami.example",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  allowed.mockReset().mockReturnValue(true);
  vi.stubEnv("RESEND_API_KEY", "test-key");
  vi.stubEnv("RESEND_EMAIL_DOMAIN", "feedback.example.org");
  vi.stubEnv("FEEDBACK_TO_EMAIL", "owner@example.org");
  provider = vi.fn().mockResolvedValue(Response.json({ id: "mail-123" }));
  vi.stubGlobal("fetch", provider);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("explicit feedback email endpoint", () => {
  it("sends only entered fields to the fixed inbox with a validated Reply-To", async () => {
    const body = payload();
    const response = await POST(request({ ...body, comment: `  ${body.comment}  ` }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sent: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    const [url, options] = provider.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers["Idempotency-Key"]).toBe(
      "whoami-feedback/trusted-daily-network-hash",
    );
    expect(JSON.parse(options.body)).toEqual({
      from: "Who Am I <notifications@feedback.example.org>",
      to: ["owner@example.org"],
      subject: copyEn.feedbackEmailSubject(copyEn.feedbackTopics.bug),
      text: copyEn.feedbackEmailBody(copyEn.feedbackTopics.bug, body.comment, body.email),
      reply_to: body.email,
    });
  });

  it("allows an anonymous message without adding Reply-To", async () => {
    expect((await POST(request({ ...payload(), email: "" }))).status).toBe(200);
    expect(JSON.parse(provider.mock.calls[0][1].body)).not.toHaveProperty("reply_to");
  });

  it("reuses the provider idempotency key on retries", async () => {
    const body = payload();
    await POST(
      request({
        ...body,
        submissionId: crypto.randomUUID(),
        comment: "A different message",
      }),
    );
    await POST(request(body));
    expect(provider.mock.calls[0][1].headers["Idempotency-Key"]).toBe(
      provider.mock.calls[1][1].headers["Idempotency-Key"],
    );
  });

  it("sets a secure daily cookie and blocks another message before calling the provider", async () => {
    const first = await POST(request(payload()));
    const cookie = first.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly; SameSite=Lax; Secure");
    expect(cookie).toContain("Max-Age=86400");
    const repeat = await POST(request(payload(), { Cookie: cookie.split(";")[0] }));
    expect(repeat.status).toBe(409);
    expect(await repeat.json()).toEqual({ error: "feedback_already_sent" });
    expect(provider).toHaveBeenCalledTimes(1);
  });

  it("blocks provider-confirmed duplicates across runtimes without claiming a new send", async () => {
    provider.mockResolvedValueOnce(
      Response.json({ name: "invalid_idempotent_request" }, { status: 409 }),
    );
    const response = await POST(request(payload()));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "feedback_already_sent" });
    expect(response.headers.get("set-cookie")).toContain("whoami-feedback-sent=");
  });

  it("does not close the form when another provider request is still pending", async () => {
    provider.mockResolvedValueOnce(
      Response.json({ name: "concurrent_idempotent_requests" }, { status: 409 }),
    );
    const response = await POST(request(payload()));
    expect(response.status).toBe(503);
    expect(response.headers.has("set-cookie")).toBe(false);
  });

  it("allows an expired daily cookie", async () => {
    expect(
      (await POST(request(payload(), { Cookie: "whoami-feedback-sent=2000-01-01" })))
        .status,
    ).toBe(200);
  });

  it.each([
    { topic: "unknown" },
    { comment: "   " },
    { comment: "x".repeat(4001) },
    { email: "bad-email" },
    { email: "a@example.org\r\nBcc: other@example.org" },
    { website: "https://spam.example" },
    { submissionId: "not-a-uuid" },
    { scores: [1, 2, 3] },
    { sessionCode: "private-code" },
    { to: "other@example.org" },
  ])("rejects invalid, automated or extra payload fields: %j", async (change) => {
    expect((await POST(request({ ...payload(), ...change }))).status).toBe(400);
    expect(provider).not.toHaveBeenCalled();
  });

  it.each(["", "https://other.example", "null"])(
    "rejects an invalid origin: %s",
    async (origin) => {
      expect((await POST(request(payload(), { Origin: origin }))).status).toBe(403);
      expect(provider).not.toHaveBeenCalled();
    },
  );

  it("rejects cross-site requests and oversized bodies before email delivery", async () => {
    expect(
      (await POST(request(payload(), { "sec-fetch-site": "cross-site" }))).status,
    ).toBe(403);
    expect((await POST(request(payload(), { "content-length": "40000" }))).status).toBe(
      413,
    );
    expect(
      (await POST(request({ ...payload(), comment: "x".repeat(40000) }))).status,
    ).toBe(413);
    expect(provider).not.toHaveBeenCalled();
  });

  it("honours rate limiting and offers a retry interval", async () => {
    allowed.mockReturnValue(false);
    const response = await POST(request(payload()));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("600");
    expect(provider).not.toHaveBeenCalled();
  });

  it.each(["RESEND_API_KEY", "RESEND_EMAIL_DOMAIN", "FEEDBACK_TO_EMAIL"])(
    "fails safely when %s is missing",
    async (key) => {
      vi.stubEnv(key, "");
      expect((await POST(request(payload()))).status).toBe(503);
      expect(provider).not.toHaveBeenCalled();
    },
  );

  it("never claims success when the email service rejects or fails", async () => {
    provider
      .mockResolvedValueOnce(Response.json({ message: "rejected" }, { status: 429 }))
      .mockResolvedValueOnce(Response.json({}))
      .mockRejectedValueOnce(new Error("network failure"));
    for (let i = 0; i < 3; i++) {
      const response = await POST(request(payload()));
      expect(response.status).toBe(503);
      expect(await response.json()).not.toHaveProperty("sent", true);
    }
  });
});
