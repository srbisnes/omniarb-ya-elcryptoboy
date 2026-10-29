import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniArbYa - ElCryptoBoy",
  description: "Omnichain Arbitrage Engine powered by CryptoYa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
