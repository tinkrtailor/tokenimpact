import type { MetadataRoute } from 'next';
import { getComparisonSlugs } from '@/lib/comparison-data';
import { getGuideSlugs } from '@/lib/guides-content';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tokenimpact.com';

// Top token pages for sitemap (matches app/token/[symbol]/page.tsx)
const TOP_SYMBOLS = [
  "BTC-USD", "BTC-USDT", "BTC-EUR",
  "ETH-USD", "ETH-USDT", "ETH-EUR",
  "SOL-USD", "SOL-USDT",
  "XRP-USD", "XRP-USDT",
  "DOGE-USD", "DOGE-USDT",
  "ADA-USD", "ADA-USDT",
  "AVAX-USD", "AVAX-USDT",
  "DOT-USD", "DOT-USDT",
  "LINK-USD", "LINK-USDT",
  "MATIC-USD", "MATIC-USDT",
  "LTC-USD", "LTC-USDT",
  "SHIB-USD", "SHIB-USDT",
  "UNI-USD", "UNI-USDT",
  "ARB-USDT",
  "PEPE-USDT",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Core pages
  const corePages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/methodology`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Exchange comparison pages
  const comparisonPages: MetadataRoute.Sitemap = getComparisonSlugs().map((slug) => ({
    url: `${BASE_URL}/compare/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Token landing pages
  const tokenPages: MetadataRoute.Sitemap = TOP_SYMBOLS.map((symbol) => ({
    url: `${BASE_URL}/token/${symbol}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Guide pages
  const guidePages: MetadataRoute.Sitemap = getGuideSlugs().map((slug) => ({
    url: `${BASE_URL}/guides/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...corePages,
    ...comparisonPages,
    ...tokenPages,
    ...guidePages,
  ];
}
