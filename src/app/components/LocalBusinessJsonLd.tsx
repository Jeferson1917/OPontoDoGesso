import { companyData } from '../data/company';

// Dados estruturados (schema.org) para o Google mostrar a empresa na busca local e no Maps
export function LocalBusinessJsonLd() {
  const { addressParts } = companyData;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: companyData.name,
    description: companyData.tagline,
    url: companyData.siteUrl,
    image: `${companyData.siteUrl}/logo.jpg`,
    telephone: `+${companyData.whatsapp}`,
    email: companyData.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: addressParts.street,
      addressLocality: addressParts.city,
      addressRegion: addressParts.state,
      postalCode: addressParts.postalCode,
      addressCountry: addressParts.country,
    },
    openingHours: companyData.openingHours,
    sameAs: [companyData.instagram],
  };

  return (
    <script
      type="application/ld+json"
      // JSON gerado só a partir de dados fixos do projeto; "<" escapado por segurança
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  );
}
