import { ExtendedSession } from '@/core/features/auth/types';

// Client-side API helper that takes session as parameter
export async function authenticatedFetch(
  url: string,
  session: ExtendedSession | null,
  options: RequestInit = {}
): Promise<Response> {
  if (!session?.accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  // If token is expired, the session will be refreshed automatically
  // by NextAuth on the next useSession call
  if (response.status === 401) {
    throw new Error('Unauthorized - token may be expired');
  }

  return response;
}

// Convenience wrapper for common HTTP methods
export function createAuthenticatedApi<T>(session: ExtendedSession | null) {
  return {
    get: async (url: string, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'GET',
        ...options,
      });
    },

    post: async (url: string, data?: T, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
    },

    put: async (url: string, data?: T, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
    },

    delete: async (url: string, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'DELETE',
        ...options,
      });
    },

    patch: async (url: string, data?: T, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
    },
  };
}

// Type-safe API response handler
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}
