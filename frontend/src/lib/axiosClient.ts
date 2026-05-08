const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

interface ApiRequestOptions extends RequestInit {
  token?: string
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('eventify_access_token') : null
  const authToken = token ?? storedToken ?? undefined
  const isFormDataBody = typeof FormData !== 'undefined' && rest.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const errorData = await response.json()
      if (typeof errorData?.detail === 'string') {
        message = errorData.detail
      } else if (Array.isArray(errorData?.detail)) {
        message = errorData.detail
          .map((item: { msg?: string }) => item.msg)
          .filter(Boolean)
          .join(', ')
      }
    } catch {
      message = response.statusText || message
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const responseText = await response.text()
  if (!responseText) {
    return undefined as T
  }

  return JSON.parse(responseText) as T
}
