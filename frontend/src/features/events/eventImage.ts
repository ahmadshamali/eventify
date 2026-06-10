const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export function resolveEventImageUrl(imageUrl: string | null | undefined): string | null {
  const value = imageUrl?.trim()
  if (!value) return null

  if (/^(https?:)?\/\//i.test(value)) return value

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  const apiOrigin = new URL(API_BASE_URL, appOrigin).origin
  return new URL(value, `${apiOrigin}/`).toString()
}
