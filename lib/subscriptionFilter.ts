import type { Subscription } from "@/lib/detection";
import {
  classifySubscriptionCategory,
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "@/lib/services";

export type CategoryFilter = "All" | ServiceCategory;

export type CategoryOption = {
  category: CategoryFilter;
  count: number;
};

export function getSubscriptionCategory(sub: Subscription): ServiceCategory {
  return (
    sub.category ??
    classifySubscriptionCategory(sub.merchant, sub.service?.category)
  );
}

export function buildCategoryOptions(
  subscriptions: Subscription[]
): CategoryOption[] {
  const counts = new Map<ServiceCategory, number>();
  for (const sub of subscriptions) {
    const cat = getSubscriptionCategory(sub);
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }

  const options: CategoryOption[] = [
    { category: "All", count: subscriptions.length },
  ];

  for (const category of SERVICE_CATEGORIES) {
    const count = counts.get(category) ?? 0;
    if (count > 0) {
      options.push({ category, count });
    }
  }

  return options;
}

export function filterSubscriptions(
  subscriptions: Subscription[],
  query: string,
  selectedCategory: CategoryFilter
): Subscription[] {
  const normalizedQuery = query.trim().toLowerCase();

  return subscriptions.filter((sub) => {
    const category = getSubscriptionCategory(sub);
    if (selectedCategory !== "All" && category !== selectedCategory) {
      return false;
    }

    if (!normalizedQuery) return true;

    const haystack = [
      sub.merchant,
      sub.frequency,
      category,
      sub.service?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
