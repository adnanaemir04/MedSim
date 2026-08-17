import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "800"] });

export const metadata: Metadata = {
  title: "Tıp Fakültesi Vaka Simülatörü",
  description: "Tıp öğrencileri için interaktif klinik vaka simülasyon platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
