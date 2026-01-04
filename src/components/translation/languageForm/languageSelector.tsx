import { JSX } from "react";
import { localeToDisplayName } from "@/app/lib";

export function LanguageSelector({
  name,
  labelString,
  locales,
  locale,
  setLocale,
}: {
  name: string;
  labelString: string;
  locales: string[];
  locale: string;
  setLocale: (value: string) => void;
}): JSX.Element {
  return (
    <div>
      <label className="flex items-center gap-2">
        {labelString}:
        <select
          name={name}
          className="border rounded px-2 py-1 focus:outline-none focus:ring-2"
          value={locale}
          onChange={({ target }) => setLocale(target.value)}
        >
          {locales.map((l) => (
            <option key={l} value={l}>
              {localeToDisplayName(l)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
