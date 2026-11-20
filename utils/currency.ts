/**
 * A product's currency as shown on screen.
 *
 * Products saved from Add Item store "€"; products from a file import (and
 * bulk create without a currency) store the code "EUR". Both show as "€".
 * Anything else is shown as stored.
 */
export const displayCurrency = (currency?: string | null) =>
  !currency || currency.toUpperCase() === "EUR" ? "€" : currency;
