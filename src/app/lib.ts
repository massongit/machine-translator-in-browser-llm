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

export async function checkLanguageDetectorAvailability(): Promise<boolean> {
  const languageDetectorAvailability: Availability =
    await LanguageDetector.availability();
  return languageDetectorAvailability !== "unavailable";
}

export async function detectLanguages(inputText: string): Promise<string[]> {
  const languageDetector: LanguageDetector = await LanguageDetector.create();
  const languageDetections: LanguageDetectionResult[] =
    await languageDetector.detect(inputText);
  return languageDetections
    .map(({ detectedLanguage }) => detectedLanguage)
    .filter((dl): dl is string => typeof dl === "string")
    .filter(canConvertToDisplayName);
}

export async function translate({
  inputText,
  sourceLanguage,
  targetLanguage,
}: {
  inputText: string;
  sourceLanguage: string;
  targetLanguage: string;
}): Promise<string> {
  const translator: Translator = await Translator.create({
    sourceLanguage,
    targetLanguage,
  });
  return await translator.translate(inputText);
}
