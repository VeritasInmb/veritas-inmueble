import { MetadataRoute } from 'next';
import { createSlug } from '../utils/slugify';

export const revalidate = 86400; // Revalidate every day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.veritasinmueble.com'; // Replace with actual production domain when ready
  
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    '',
    '/directorio',
    '/nosotros',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Fetch agencies
    const agenciesRes = await fetch('https://firestore.googleapis.com/v1/projects/veritas-inmueble-2/databases/(default)/documents/inmobiliarias');
    const agenciesData = await agenciesRes.json();
    
    if (agenciesData.documents) {
        agenciesData.documents.forEach((doc: any) => {
            const id = doc.name.split('/').pop();
            const nombre = doc.fields?.nombre?.stringValue || 'agencia';
            const slug = createSlug(nombre, id);
            routes.push({
                url: `${baseUrl}/inmobiliaria/${slug}`,
                lastModified: new Date().toISOString(),
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        });
    }

    // Fetch blogs
    const blogsRes = await fetch('https://firestore.googleapis.com/v1/projects/veritas-inmueble-2/databases/(default)/documents/blogs');
    const blogsData = await blogsRes.json();
    
    if (blogsData.documents) {
        blogsData.documents.forEach((doc: any) => {
            const id = doc.name.split('/').pop();
            const title = doc.fields?.title?.stringValue || 'articulo';
            const slug = createSlug(title, id);
            routes.push({
                url: `${baseUrl}/blog/${slug}`,
                lastModified: new Date().toISOString(),
                changeFrequency: 'monthly',
                priority: 0.5,
            });
        });
    }
  } catch(error) {
    console.error("Sitemap generation error:", error);
  }

  return routes;
}
