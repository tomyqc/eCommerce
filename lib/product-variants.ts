export type VariantPrices = Record<string, number>;

export const parseOptions = (value?: string | null) =>
  String(value || "").split(",").map((option) => option.trim()).filter(Boolean);

export const getVariantPrice = (basePrice: number, size?: string | null, variantPrices?: VariantPrices | null) => {
  const price = size && variantPrices?.[size];
  return typeof price === "number" && Number.isFinite(price) && price >= 0 ? price : basePrice;
};