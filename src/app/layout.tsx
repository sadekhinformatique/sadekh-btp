import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/sadekh/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SADEKH BTP — Marketplace Immobilière Sénégalaise",
  description: "Maisons, appartements, terrains et plans architecturaux. La première marketplace immobilière pensée pour le marché sénégalais. Paiement mobile Wave & Orange Money.",
  keywords: "immobilier, Sénégal, Dakar, maison, appartement, terrain, plan architectural, Wave, Orange Money, SADEKH BTP",
  manifest: "/manifest.json",
  openGraph: {
    title: "SADEKH BTP — Marketplace Immobilière Sénégalaise",
    description: "Trouvez votre bien immobilier au Sénégal",
    type: "website",
    locale: "fr_SN",
    siteName: "SADEKH BTP",
    images: [{ url: "/logo-sadekh.png", width: 2944, height: 2944, alt: "SADEKH BTP" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SADEKH BTP — Marketplace Immobilière Sénégalaise",
    description: "Trouvez votre bien immobilier au Sénégal",
    images: ["/logo-sadekh.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "SADEKH BTP",
    "theme-color": "#1B5E20",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}