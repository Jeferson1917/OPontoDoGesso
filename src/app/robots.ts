import type { MetadataRoute } from 'next';
import { companyData } from './data/company';

export default function robots(): MetadataRoute.Robots {
  return {
    // O painel administrativo não deve aparecer em buscadores
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${companyData.siteUrl}/sitemap.xml`,
  };
}
