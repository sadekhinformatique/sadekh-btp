export default function StructuredData() {
  const jsonLd = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}