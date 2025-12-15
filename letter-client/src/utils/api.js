// Utility function to get the backend URL with proper formatting
export function getBackendUrl() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  // Remove trailing slash if present to avoid double slashes
  return backendUrl.replace(/\/+$/, '');
}

// Helper function to construct API URLs
export function getApiUrl(path) {
  const backendUrl = getBackendUrl();
  // Ensure path starts with / but doesn't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendUrl}${cleanPath}`;
}

