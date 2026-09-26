export interface CurrencyConfig {
  symbol: string;
  locale: string;
}

/**
 * Returns the display symbol and Intl locale for a given ISO currency code.
 * Defaults to INR if no code is provided.
 */
export const getCurrencyConfig = (currency: string = "INR"): CurrencyConfig => {
  const code = currency.toUpperCase();
  switch (code) {
    case "INR":
      return { symbol: "₹", locale: "en-IN" };
    case "EUR":
      return { symbol: "€", locale: "de-DE" };
    case "GBP":
      return { symbol: "£", locale: "en-GB" };
    case "JPY":
      return { symbol: "¥", locale: "ja-JP" };
    case "AED":
      return { symbol: "AED ", locale: "en-AE" };
    case "SGD":
      return { symbol: "S$", locale: "en-SG" };
    case "CAD":
      return { symbol: "C$", locale: "en-CA" };
    case "AUD":
      return { symbol: "A$", locale: "en-AU" };
    case "USD":
    default:
      return { symbol: "$", locale: "en-US" };
  }
};
