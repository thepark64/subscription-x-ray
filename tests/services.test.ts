import { describe, expect, it } from "vitest";
import {
  findKnownService,
  getCancellationGuidance,
} from "../lib/services";

describe("services and cancellation guidance", () => {
  it("matches Indian subscription brands and AI tools", () => {
    expect(findKnownService("SWIGGY ONE MEMBERSHIP")?.name).toBe("Swiggy One");
    expect(findKnownService("CULTFIT INDIA BANGALORE")?.name).toBe("Cult.fit");
    expect(findKnownService("OPENAI CHATGPT SUBSCRIPTION")?.name).toBe(
      "ChatGPT / OpenAI"
    );
    expect(findKnownService("JIOHOTSTAR VIP")?.url).toContain("hotstar.com");
  });

  it("includes UPI AutoPay app shortcuts when payment rail is UPI AutoPay", () => {
    const guidance = getCancellationGuidance("Spotify", "upi_autopay");
    expect(guidance.title).toMatch(/UPI AutoPay/i);
    expect(guidance.appShortcuts?.map((s) => s.app)).toEqual([
      "Google Pay",
      "PhonePe",
      "Paytm",
      "BHIM",
    ]);
  });

  it("provides NACH and Card SI guidance without inventing UPI shortcuts", () => {
    const nach = getCancellationGuidance("Cult.fit", "nach_emandate");
    expect(nach.title).toMatch(/NACH/i);
    expect(nach.appShortcuts).toBeUndefined();

    const card = getCancellationGuidance("Netflix", "card_si");
    expect(card.title).toMatch(/Standing Instruction/i);
    expect(card.appShortcuts).toBeUndefined();
  });
});
