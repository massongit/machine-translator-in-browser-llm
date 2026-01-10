"use client";
import { JSX, useEffect, useState } from "react";
import { InputForm } from "@/components/translation/inputForm";
import { LanguageForm } from "@/components/translation/languageForm/languageForm";

export default function Translation(): JSX.Element {
  const [isSupportedBrowser, setIsSupportedBrowser] = useState<boolean>(false);
  const [inputText, setInputText] = useState("");
  const [sourceLocales, setSourceLocales] = useState<string[]>([]);
  const [outputText, setOutputText] = useState("");
  const [sourceLocale, setSourceLocale] = useState("");

  // APIの存在チェック
  useEffect(() => {
    if ("LanguageDetector" in self && "Translator" in self) {
      // LanguageDetectorの実際の利用可能性をチェック
      (async () => {
        const languageDetectorAvailability: Availability =
          await LanguageDetector.availability();
        setIsSupportedBrowser(languageDetectorAvailability !== "unavailable");
      })();
    }
  }, []);

  if (!isSupportedBrowser) {
    return <div>非対応ブラウザです。</div>;
  }

  return (
    <div className="m-auto flex flex-col gap-2">
      <InputForm
        inputText={inputText}
        setInputText={setInputText}
        setSourceLocales={setSourceLocales}
        setSourceLocale={setSourceLocale}
        setOutputText={setOutputText}
      />
      <LanguageForm
        inputText={inputText}
        sourceLocales={sourceLocales}
        sourceLanguage={sourceLocale}
        setSourceLocale={setSourceLocale}
        setOutputText={setOutputText}
      />
      {outputText !== "" && <div>翻訳結果: {outputText}</div>}
    </div>
  );
}
