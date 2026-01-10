import type { Metadata } from "next";
import type { ReactNode } from "react";
import { defaultLocale } from "@/app/lib";
import "./globals.css";

export const metadata: Metadata = {
  title: "ブラウザ内のLLMモデルによる言語推定と機械翻訳",
  description: "ブラウザ内のLLMモデルによる言語推定と機械翻訳",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang={defaultLocale}>
      <body className="antialiased m-0">{children}</body>
    </html>
  );
}
