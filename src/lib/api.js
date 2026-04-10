const apiBaseUrl =
  import.meta?.env?.VITE_API_BASE_URL ||
  import.meta?.env?.NEXT_PUBLIC_API_BASE_URL ||
  ''

export function apiUrl(path) {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
    return path
  }

  if (!apiBaseUrl) return path
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`
}
