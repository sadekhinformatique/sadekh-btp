export default function StructuredData() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SADEKH BTP",
    "description": "Marketplace immobilière sénégalaise — Maisons, appartements, terrains et plans architecturaux",
    "url": "https://sadekhbtp.sn",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://sadekhbtp.sn/?search={search_term_string}",
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
    "name": "SADEKH BTP",
    "url": "https://sadekhbtp.sn",
    "logo": "https://sadekhbtp.sn/logo-sadekh.png",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+221-77-000-0000",
      "contactType": "customer service",
      "availableLanguage": ["fr", "wo"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Sénégal"
    }
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "SADEKH BTP",
    "description": "La première marketplace immobilière pensée pour le marché sénégalais",
    "url": "https://sadekhbtp.sn",
    "image": "https://sadekhbtp.sn/logo-sadekh.png",
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