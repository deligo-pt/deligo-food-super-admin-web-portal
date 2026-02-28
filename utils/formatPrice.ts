export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
  }).format(price);
};
