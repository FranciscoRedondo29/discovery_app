import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discovery - Leitura sem barreiras",
  description: "O companheiro de IA que adapta textos e analisa o progresso de leitura. Otimizado para dislexia em Português.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
