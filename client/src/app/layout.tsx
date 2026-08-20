import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "800"] });

export const metadata: Metadata = {
  title: "Tıp Fakültesi Vaka Simülatörü",
  description: "Tıp öğrencileri için interaktif klinik vaka simülasyon platformu.",
};

import Providers from "../presentation/context/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* Animated Background Mesh */}
          <div className="bg-mesh">
            <div className="mesh-blob blob-1"></div>
            <div className="mesh-blob blob-2"></div>
            <div className="mesh-blob blob-3"></div>
          </div>
          <div className="app-wrapper">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
