export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
  }).format(price);
};
