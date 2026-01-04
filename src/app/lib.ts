export const defaultLocale: string = "ja";

export function localeToDisplayName(locale: string): string | undefined {
  const displayNames: Intl.DisplayNames = new Intl.DisplayNames(defaultLocale, {
    type: "language",
  });
  return displayNames.of(locale);
}

export function canConvertToDisplayName(locale: string) {
  return locale !== "und" && localeToDisplayName(locale) !== locale;
}
