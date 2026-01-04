import { JSX } from "react";
import Translation from "@/components/translation/translation";

export function Body(): JSX.Element {
  return (
    <>
      <h1>ブラウザ内のLLMモデルによる言語推定と機械翻訳</h1>
      <Translation />
    </>
  );
}
