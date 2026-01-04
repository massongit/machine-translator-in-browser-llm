import { JSX, useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { canConvertToDisplayName } from "@/app/lib";

export function InputForm({
  inputText,
  setInputText,
  setSourceLocales,
  setSourceLocale,
  setOutputText,
}: {
  inputText: string;
  setInputText: (value: string) => void;
  setSourceLocales: (value: string[]) => void;
  setSourceLocale: (value: string) => void;
  setOutputText: (value: string) => void;
}): JSX.Element {
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const onButtonClick = async () => {
    setLoading(true);
    setSourceLocales([]);
    setOutputText("");
    const languageDetector: LanguageDetector = await LanguageDetector.create();
    const languageDetections: LanguageDetectionResult[] =
      await languageDetector.detect(inputText);
    const newSourceLocales: string[] = languageDetections
      .map(({ detectedLanguage }) => detectedLanguage)
      .filter((dl): dl is string => typeof dl === "string")
      .filter(canConvertToDisplayName);

    if (0 < newSourceLocales.length) {
      setSourceLocales(newSourceLocales);
      setSourceLocale(newSourceLocales[0]);
    }
    setLoading(false);
  };
  useEffect(
    () => setButtonDisabled(loading || inputText === ""),
    [loading, inputText],
  );
  return (
    <div className="flex gap-2">
      <label className="flex flex-1 items-center gap-2">
        翻訳したい文:
        <input
          name="input"
          className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2"
          value={inputText}
          onChange={({ target }) => setInputText(target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={async ({ key }) => {
            if (!buttonDisabled && !isComposing && key === "Enter") {
              await onButtonClick();
            }
          }}
        />
      </label>
      <button
        className="border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onButtonClick}
        disabled={buttonDisabled}
      >
        言語推定
        <BarLoader width="100%" loading={loading} />
      </button>
    </div>
  );
}
