export const formatDZD = (amount: number | null | undefined) =>
  `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))} DZD`;

export const getDiscountedPrice = (price: number, discountPercent: number) =>
  Number(price || 0) * (1 - Math.max(0, Math.min(100, Number(discountPercent) || 0)) / 100);
