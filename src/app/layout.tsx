import "./globals.css";
import type { Metadata } from "next";
import RootLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Smart TechInfo — Appliance Repair & Services",
  description: "SmartTechInfo provides trusted appliance repair services — AC, refrigerator, washing machine and more. Book certified technicians online.",
  metadataBase: new URL("https://smarttechinfo.in"),
  openGraph: {
    title: "Smart TechInfo — Appliance Repair & Services",
    description: "Trusted appliance repair services — AC, refrigerator, washing machine and more. Book certified technicians online.",
    url: "https://smarttechinfo.in",
    siteName: "SmartTechInfo",
    images: [
      {
        url: "https://smarttechinfo.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartTechInfo"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart TechInfo",
    description: "Trusted appliance repair services — Book certified technicians online.",
    images: ["https://smarttechinfo.in/og-image.png"]
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
