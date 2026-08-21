export const bottomPageSections = ["sale", "about", "buying", "support"] as const;
export type BottomPageSection = (typeof bottomPageSections)[number];

export const bottomPageSectionLabels: Record<BottomPageSection, string> = {
  sale: "Sale",
  about: "About Us",
  buying: "Buying",
  support: "Support",
};
