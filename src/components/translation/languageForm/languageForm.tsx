import type { LanguageCode } from "iso-639-1";
import ISO6391 from "iso-639-1";
import { JSX, useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { LanguageSelector } from "@/components/translation/languageForm/languageSelector";
import { canConvertToDisplayName, defaultLocale } from "@/app/lib";

export function LanguageForm({
  inputText,
  sourceLocales,
  sourceLanguage,
  setSourceLocale,
  setOutputText,
}: {
  inputText: string;
  sourceLocales: string[];
  sourceLanguage: string;
  setSourceLocale: (value: string) => void;
  setOutputText: (value: string) => void;
}): JSX.Element | undefined {
  const [targetLanguage, setTargetLanguage] = useState(defaultLocale);
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const allLocales: LanguageCode[] = ISO6391.getAllCodes().filter(
    canConvertToDisplayName,
  );
  useEffect(() => {
    if (
      sourceLocales.length === 0 ||
      loading ||
      sourceLanguage === targetLanguage
    ) {
      setButtonDisabled(true);
      return;
    }

    (async () => {
      const availability: Availability = await Translator.availability({
        sourceLanguage,
        targetLanguage,
      });
      setButtonDisabled(availability === "unavailable");
    })();
  }, [loading, sourceLocales, sourceLanguage, targetLanguage]);

  if (sourceLocales.length === 0) {
    return;
  }

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-2">
        <LanguageSelector
          name="source_language"
          labelString="翻訳元の言語"
          locales={sourceLocales.concat(
            allLocales.filter((l) => !sourceLocales.includes(l)),
          )}
          locale={sourceLanguage}
          setLocale={setSourceLocale}
        />
        <LanguageSelector
          name="target_language"
          labelString="翻訳先の言語"
          locales={allLocales}
          locale={targetLanguage}
          setLocale={setTargetLanguage}
        />
      </div>
      <button
        className="border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={async () => {
          setLoading(true);
          setOutputText("");
          const translator: Translator = await Translator.create({
            sourceLanguage,
            targetLanguage,
          });
          setOutputText(await translator.translate(inputText));
          setLoading(false);
        }}
        disabled={buttonDisabled}
      >
        翻訳
        <BarLoader width="100%" loading={loading} />
      </button>
    </div>
  );
}
