import { algoliasearch } from 'algoliasearch';

// Usamos el cliente v5 de algoliasearch
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';

// Inicializamos el cliente de búsqueda
export const algoliaClient = algoliasearch(appId, searchApiKey);
export const INDEX_NAME = 'inmobiliarias_index';
