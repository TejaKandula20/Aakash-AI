// Aakash AI Asset Path Normalizer
// Resolves relative asset URLs reliably across:
// 1. Local development (http://localhost:5173/)
// 2. GitHub Pages subpath deployment (https://tejakandula20.github.io/Aakash-AI/)
// 3. Static preview or custom hosting environments

export function getAssetUrl(path) {
  if (!path) return '';

  // Return absolute external URLs or data/blob URIs as-is
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('data:') || 
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Strip leading slash so it can safely append to base URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // In Vite, import.meta.env.BASE_URL represents the configured base (e.g., './' or '/Aakash-AI/')
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) 
    ? import.meta.env.BASE_URL 
    : './';

  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}${cleanPath}`;
}
