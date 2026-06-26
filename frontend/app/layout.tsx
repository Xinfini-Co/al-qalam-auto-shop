import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SHOP } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Al Qalam Auto Shop — Sharjah, UAE",
    template: "%s · Al Qalam Auto Shop",
  },
  description: `${SHOP.tagline}. ${SHOP.city}`,
  keywords: ["auto repair", "denting", "painting", "Sharjah", "garage", "Al Qalam"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
