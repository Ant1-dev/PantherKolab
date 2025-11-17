/**
 * useParameter Hook
 *
 * React hook for fetching parameters from AWS Parameter Store
 * with automatic caching and loading states
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { value, loading, error } = useParameter('cognito/user-pool-id');
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>User Pool ID: {value}</div>;
 * }
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParameterStoreContext } from '@/lib/parameterStore/ParameterStoreContext';
import type { ParameterKey, ParameterFetchOptions } from '@/types/parameters';

interface UseParameterResult {
  /** Parameter value (null if not loaded) */
  value: string | null;

  /** Loading state */
  loading: boolean;

  /** Error if fetch failed */
  error: Error | null;

  /** Manually refresh the parameter */
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and cache a single parameter
 *
 * @param key - Parameter key to fetch
 * @param options - Fetch options
 * @returns Parameter value, loading state, error, and refresh function
 */
export function useParameter(
  key: ParameterKey,
  options: ParameterFetchOptions = {}
): UseParameterResult {
  const { getParameter } = useParameterStoreContext();
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchParameter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const paramValue = await getParameter(key, options);
      setValue(paramValue);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch parameter');
      setError(error);
      console.error(`[useParameter] Error fetching ${key}:`, error);
    } finally {
      setLoading(false);
    }
  }, [key, getParameter, options]);

  // Fetch on mount and when key changes
  useEffect(() => {
    fetchParameter();
  }, [fetchParameter]);

  // Refresh function with forced cache bypass
  const refresh = useCallback(async () => {
    await fetchParameter();
  }, [fetchParameter]);

  return { value, loading, error, refresh };
}

/**
 * Hook to fetch multiple parameters at once
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { values, loading, error } = useParameters([
 *     'cognito/user-pool-id',
 *     'cognito/client-id'
 *   ]);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <div>Pool ID: {values['cognito/user-pool-id']}</div>
 *       <div>Client ID: {values['cognito/client-id']}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useParameters(
  keys: ParameterKey[],
  options: ParameterFetchOptions = {}
): {
  values: Record<string, string>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const { getParameters } = useParameterStoreContext();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchParameters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const paramValues = await getParameters(keys, options);
      setValues(paramValues);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch parameters');
      setError(error);
      console.error('[useParameters] Error fetching parameters:', error);
    } finally {
      setLoading(false);
    }
  }, [keys, getParameters, options]);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);

  const refresh = useCallback(async () => {
    await fetchParameters();
  }, [fetchParameters]);

  return { values, loading, error, refresh };
}

/**
 * Hook to get a specific parameter with a fallback value
 *
 * Returns the parameter value or fallback if not available
 * Useful for optional configuration
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const redirectUrl = useParameterWithFallback(
 *     'app-urls/redirect-sign-in',
 *     'http://localhost:3000/'
 *   );
 *
 *   return <div>Redirect: {redirectUrl}</div>;
 * }
 * ```
 */
export function useParameterWithFallback(
  key: ParameterKey,
  fallback: string,
  options?: ParameterFetchOptions
): string {
  const { value, loading, error } = useParameter(key, options);

  if (loading || error) {
    return fallback;
  }

  return value ?? fallback;
}