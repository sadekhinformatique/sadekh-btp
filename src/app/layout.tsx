import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/sadekh/StructuredData";
import { pool, toCamelCase } from "@/lib/supabase-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultMeta = {
  siteName: "SADEKH BTP",
  seoTitle: "SADEKH BTP — Marketplace Immobilière Sénégalaise",
  seoDescription: "Maisons, appartements, terrains et plans architecturaux. La première marketplace immobilière pensée pour le marché sénégalais. Paiement mobile Wave & Orange Money.",
  seoKeywords: "immobilier, Sénégal, Dakar, maison, appartement, terrain, plan architectural",
  logoUrl: "/logo-sadekh.png",
  primaryColor: "#df2531",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const result = await pool.query(`SELECT * FROM site_settings WHERE id = 1`);
    const s = result.rows[0] ? toCamelCase(result.rows[0]) : defaultMeta;
    return {
      metadataBase: new URL("https://sadekhbtp.sn"),
      title: s.seoTitle || defaultMeta.seoTitle,
      description: s.seoDescription || defaultMeta.seoDescription,
      keywords: s.seoKeywords || defaultMeta.seoKeywords,
      manifest: "/manifest.json",
      openGraph: {
        title: s.seoTitle || defaultMeta.seoTitle,
        description: s.seoDescription || defaultMeta.seoDescription,
        type: "website",
        locale: "fr_SN",
        siteName: s.siteName || defaultMeta.siteName,
        images: [{ url: s.logoUrl || defaultMeta.logoUrl, width: 2944, height: 2944, alt: s.siteName || defaultMeta.siteName }],
      },
      twitter: {
        card: "summary_large_image",
        title: s.seoTitle || defaultMeta.seoTitle,
        description: s.seoDescription || defaultMeta.seoDescription,
        images: [s.logoUrl || defaultMeta.logoUrl],
      },
      other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": (s.siteName || defaultMeta.siteName).split(' ')[0],
        "theme-color": s.primaryColor || defaultMeta.primaryColor,
      },
    };
  } catch {
    return {
      metadataBase: new URL("https://sadekhbtp.sn"),
      title: defaultMeta.seoTitle,
      description: defaultMeta.seoDescription,
      keywords: defaultMeta.seoKeywords,
      manifest: "/manifest.json",
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="apple-touch-icon" content="/logo-sadekh.png" />
        <link rel="icon" href="/logo-sadekh.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <StructuredData />
        {children}
        {/* Register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}