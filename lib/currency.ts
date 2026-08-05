// Geo-guess only covers common visitor countries for a NYC recruitment
// site; anything unmapped falls back to USD. The manual picker (see
// CurrencyPicker) is the real safety net for anyone geo-guessed wrong.
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL",
  GB: "GBP", IE: "EUR", FR: "EUR", DE: "EUR", ES: "EUR", IT: "EUR",
  NL: "EUR", PT: "EUR", BE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
  CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK",
  HU: "HUF", RO: "RON", IS: "ISK", TR: "TRY", ZA: "ZAR",
  NG: "USD", IN: "INR", CN: "CNY", JP: "JPY", KR: "KRW",
  SG: "SGD", HK: "HKD", MY: "MYR", ID: "IDR", PH: "PHP", TH: "THB",
  AU: "AUD", NZ: "NZD", IL: "ILS",
};

export const SUPPORTED_CURRENCIES = [
  "USD", "CAD", "MXN", "BRL", "GBP", "EUR", "CHF", "SEK", "NOK", "DKK",
  "PLN", "CZK", "HUF", "RON", "ISK", "TRY", "ZAR", "INR", "CNY", "JPY",
  "KRW", "SGD", "HKD", "MYR", "IDR", "PHP", "THB", "AUD", "NZD", "ILS",
] as const;

export type FxRates = Record<string, number>; // target currency -> rate, base USD

export function convertUsd(amountUsd: number, currency: string, rates: FxRates): number {
  if (currency === "USD") return amountUsd;
  const rate = rates[currency];
  return rate ? amountUsd * rate : amountUsd;
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}

export function currencyForCountry(countryCode: string | null | undefined): string {
  if (!countryCode) return "USD";
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? "USD";
}
