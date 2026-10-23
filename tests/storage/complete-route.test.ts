import { describe, expect, it } from "vitest";
import { POST as save } from "@/app/api/storage/complete/route";
import { POST as feedback } from "@/app/api/storage/feedback/route";
describe("retired write routes", () => {
  it("permanently rejects new saves and feedback", async () => {
    expect(save().status).toBe(410);
    expect(await save().json()).toEqual({ error: "saving_removed" });
    expect(feedback().status).toBe(410);
  });
});
