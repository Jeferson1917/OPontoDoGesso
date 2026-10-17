import type { MetadataRoute } from 'next';
import { companyData } from './data/company';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: companyData.siteUrl, changeFrequency: 'monthly', priority: 1 }];
}
