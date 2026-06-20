import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  openGraph: {
    title: "SADEKH BTP — Marketplace Immobilière Sénégalaise",
    description: "Trouvez votre bien immobilier au Sénégal",
    type: "website",
    locale: "fr_SN",
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
        {children}
      </body>
    </html>
  );
}