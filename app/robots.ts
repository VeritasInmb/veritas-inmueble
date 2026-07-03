import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'], // Prevent crawling of private/api routes
    },
    sitemap: 'https://www.veritasinmueble.com/sitemap.xml',
  };
}
