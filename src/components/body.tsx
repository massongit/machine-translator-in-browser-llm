"use client";
import dynamic from "next/dynamic";
import { JSX } from "react";

const Translation = dynamic(
  () => import("@/components/translation/translation"),
  { ssr: false },
);

export function Body(): JSX.Element {
  return (
    <>
      <h1>ブラウザ内のLLMによる言語推定と機械翻訳</h1>
      <Translation />
    </>
  );
}
