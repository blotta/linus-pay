export function getBrowserLocale(): string {
  return navigator.language ?? navigator.languages?.[0] ?? "en-US";
}

export function numberToLocaleCurrencyStr(
  value: number,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function numberToLocaleStr(
  value: number,
  locale: string,
  digits: number = 2,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
