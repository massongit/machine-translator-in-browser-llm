import type { LanguageCode } from "iso-639-1";
import ISO6391 from "iso-639-1";
import { JSX, useState } from "react";
import { BarLoader } from "react-spinners";
import { LanguageSelector } from "@/components/translation/languageForm/languageSelector";
import {
  canConvertToDisplayName,
  defaultLocale,
  localeToDisplayName,
  translate,
} from "@/app/lib";

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
  const allLocales: LanguageCode[] = ISO6391.getAllCodes().filter(
    canConvertToDisplayName,
  );

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

          try {
            setOutputText(
              await translate({ inputText, sourceLanguage, targetLanguage }),
            );
          } catch {
            alert(
              `${localeToDisplayName(sourceLanguage)}から${localeToDisplayName(targetLanguage)}への翻訳には対応していません。`,
            );
          }

          setLoading(false);
        }}
        disabled={loading || sourceLanguage === targetLanguage}
      >
        翻訳
        <BarLoader width="100%" loading={loading} />
      </button>
    </div>
  );
}
