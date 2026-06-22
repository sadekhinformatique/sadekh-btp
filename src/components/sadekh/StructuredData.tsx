import { pool, toCamelCase } from '@/lib/supabase-server';

const BASE_URL = "https://sadekhbtp.sn";

export default async function StructuredData() {
  let settings: any = null;
  try {
    const result = await pool.query(`SELECT * FROM site_settings WHERE id = 1`);
    if (result.rows[0]) settings = toCamelCase(result.rows[0]);
  } catch {}

  const name = settings?.siteName || "SADEKH BTP";
  const desc = settings?.seoDescription || "Marketplace immobilière sénégalaise";
  const logo = settings?.logoUrl || "/logo-sadekh.png";
  const phone = settings?.contactPhone || "";
  const sameAs = [settings?.facebook, settings?.instagram, settings?.twitter, settings?.youtube, settings?.tiktok].filter(Boolean) as string[];

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "description": desc,
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["fr", "wo"],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SN",
      "addressRegion": "Dakar"
    }
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": BASE_URL,
    "logo": logo.startsWith("http") ? logo : `${BASE_URL}${logo}`,
    "sameAs": sameAs,
    ...(phone ? {
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": phone,
        "contactType": "customer service",
        "availableLanguage": ["fr", "wo"]
      }
    } : {}),
    "areaServed": {
      "@type": "Country",
      "name": "Sénégal"
    }
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": name,
    "description": desc,
    "url": BASE_URL,
    "image": logo.startsWith("http") ? logo : `${BASE_URL}${logo}`,
    "priceRange": "15 000 FCFA - 185 000 000 FCFA",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dakar",
      "addressCountry": "SN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "08:00",
      "closes": "20:00"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
    </>
  );
}