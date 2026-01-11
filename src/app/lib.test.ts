import { describe, expect, test } from "@jest/globals";
import { canConvertToDisplayName, localeToDisplayName } from "./lib";

describe("localeToDisplayName", () => {
  test("should convert valid language codes to Japanese display names", () => {
    for (const [locale, displayName] of Object.entries({
      en: "英語",
      ja: "日本語",
      fr: "フランス語",
      de: "ドイツ語",
      es: "スペイン語",
      zh: "中国語",
      ko: "韓国語",
    })) {
      expect(localeToDisplayName(locale)).toBe(displayName);
    }
  });

  test("should return the same code for unknown language codes", () => {
    // ISO 639-1に存在しない言語コードはそのまま返される
    for (const locale of ["zz", "xx"]) {
      expect(localeToDisplayName(locale)).toBe(locale);
    }
  });

  test("should throw RangeError for empty string", () =>
    // 空文字列を渡すとRangeErrorが発生する
    expect(() => localeToDisplayName("")).toThrow(RangeError));
});

describe("canConvertToDisplayName", () => {
  test("should return true for valid convertible language codes", () => {
    for (const locale of [
      "en",
      "ja",
      "fr",
      "de",
      "es",
      "zh",
      "ko",
      "aa", // "アファル語"に変換可能
    ]) {
      expect(canConvertToDisplayName(locale)).toBe(true);
    }
  });

  test("should return false for 'und' (undetermined)", () =>
    // "und"は除外される
    expect(canConvertToDisplayName("und")).toBe(false));

  test("should return false for unknown language codes", () => {
    // 表示名に変換できないコード（そのまま返される）はfalseを返す
    for (const locale of ["zz", "xx"]) {
      expect(canConvertToDisplayName(locale)).toBe(false);
    }
  });

  test("should throw RangeError for empty string", () =>
    // 空文字列を渡すとRangeErrorが発生する
    expect(() => canConvertToDisplayName("")).toThrow(RangeError));

  test("should filter out non-displayable codes", () =>
    // "en", "ja", "aa", "fr"が残る（"und", "zz"は除外される）
    expect(
      ["en", "ja", "und", "aa", "zz", "fr"].filter(canConvertToDisplayName),
    ).toEqual(["en", "ja", "aa", "fr"]));
});
