import { describe, expect, it } from "vitest";
import type { Subscription } from "../lib/detection";
import { classifySubscriptionCategory } from "../lib/services";
import {
  buildCategoryOptions,
  filterSubscriptions,
} from "../lib/subscriptionFilter";

const sampleSubscriptions: Subscription[] = [
  {
    merchant: "Netflix",
    amount: 649,
    frequency: "monthly",
    occurrences: 3,
    monthlyEquivalent: 649,
    category: "Streaming & Media",
    service: {
      name: "Netflix",
      url: "https://www.netflix.com/cancelplan",
      label: "Manage / cancel",
      category: "Streaming & Media",
    },
  },
  {
    merchant: "Google One",
    amount: 130,
    frequency: "monthly",
    occurrences: 3,
    monthlyEquivalent: 130,
    category: "Cloud & Storage",
  },
  {
    merchant: "Adobe",
    amount: 4230,
    frequency: "annual",
    occurrences: 2,
    monthlyEquivalent: 352.5,
    category: "Software & Apps",
  },
  {
    merchant: "ACT Fibernet Broadband",
    amount: 1099,
    frequency: "monthly",
    occurrences: 4,
    monthlyEquivalent: 1099,
    category: "Other",
  },
];

describe("classifySubscriptionCategory", () => {
  it("classifies known services and keyword matches accurately", () => {
    expect(classifySubscriptionCategory("Netflix")).toBe("Streaming & Media");
    expect(classifySubscriptionCategory("OPENAI CHATGPT PLUS")).toBe(
      "Software & Apps"
    );
    expect(classifySubscriptionCategory("APPLE ICLOUD STORAGE")).toBe(
      "Cloud & Storage"
    );
    expect(classifySubscriptionCategory("CULTFIT MEMBERSHIP")).toBe(
      "Membership"
    );
    expect(classifySubscriptionCategory("ACT Fibernet")).toBe("Other");
  });
});

describe("buildCategoryOptions", () => {
  it("includes All plus only categories present in the scan results", () => {
    const options = buildCategoryOptions(sampleSubscriptions);
    expect(options).toEqual([
      { category: "All", count: 4 },
      { category: "Streaming & Media", count: 1 },
      { category: "Software & Apps", count: 1 },
      { category: "Cloud & Storage", count: 1 },
      { category: "Other", count: 1 },
    ]);
  });
});

describe("filterSubscriptions", () => {
  it("filters by search query across merchant, frequency, and category", () => {
    expect(filterSubscriptions(sampleSubscriptions, "net", "All")).toHaveLength(
      2
    ); // Netflix + ACT Fibernet
    expect(
      filterSubscriptions(sampleSubscriptions, "  annual ", "All")
    ).toHaveLength(1);
    expect(
      filterSubscriptions(sampleSubscriptions, "netflix", "Streaming & Media")
    ).toHaveLength(1);
    expect(
      filterSubscriptions(sampleSubscriptions, "netflix", "Cloud & Storage")
    ).toHaveLength(0);
  });
});
