import { fetchAuthSession } from 'aws-amplify/auth';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });
    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
