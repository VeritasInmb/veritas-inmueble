export function createSlug(name: string, id: string): string {
    const cleanName = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/(^-|-$)+/g, ''); // Remove leading or trailing hyphens
        
    return `${cleanName}-${id}`;
}

export function extractIdFromSlug(slug: string): string {
    const parts = slug.split('-');
    return parts[parts.length - 1]; // The ID is always the last part
}
