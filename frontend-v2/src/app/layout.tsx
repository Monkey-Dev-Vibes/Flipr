import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ServiceWorkerProvider } from "@/providers/ServiceWorkerProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1A1A1A",
};

export const metadata: Metadata = {
  title: "Flipr v2 — Predict. Trade. Win.",
  description:
    "The gamified prediction market. Browse markets, pick your side, and swipe up to trade.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flipr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        <PrivyProvider>
          <AuthProvider>
            <ServiceWorkerProvider>{children}</ServiceWorkerProvider>
          </AuthProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
