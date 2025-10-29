/**
 * Example Usage of Parameter Store Integration
 *
 * This file demonstrates how to use the Parameter Store system
 * in various scenarios within the PantherKolab application
 */

// ============================================
// EXAMPLE 1: App-wide Setup (Root Layout)
// ============================================

// src/app/layout.tsx
import { ParameterStoreProvider } from '@/lib/parameterStore/ParameterStoreContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ParameterStoreProvider
          config={{
            region: process.env.AWS_REGION || 'us-east-1',
            environment: (process.env.NODE_ENV === 'production' ? 'prod' : 'dev') as 'dev' | 'staging' | 'prod',
            prefix: '/panther-kolab',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          }}
          // Pre-fetch commonly used parameters
          prefetchKeys={[
            'cognito/user-pool-id',
            'cognito/client-id',
            'cognito/domain',
            'dynamodb/users-table',
            'dynamodb/messages-table',
          ]}
        >
          {children}
        </ParameterStoreProvider>
      </body>
    </html>
  );
}

// ============================================
// EXAMPLE 2: Simple Component Usage
// ============================================

'use client';

import { useParameter } from '@/hooks/useParameter';

export function UserPoolDisplay() {
  const { value, loading, error } = useParameter('cognito/user-pool-id');

  if (loading) {
    return <div className="animate-pulse">Loading configuration...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded">
      <h3 className="font-bold">User Pool ID</h3>
      <p className="font-mono text-sm">{value}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Multiple Parameters
// ============================================

import { useParameters } from '@/hooks/useParameter';

export function ConfigurationDashboard() {
  const { values, loading, error, refresh } = useParameters([
    'cognito/user-pool-id',
    'cognito/client-id',
    'dynamodb/users-table',
    'dynamodb/messages-table',
  ]);

  if (loading) return <div>Loading configurations...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuration</h2>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ConfigCard
          title="User Pool ID"
          value={values['cognito/user-pool-id']}
        />
        <ConfigCard
          title="Client ID"
          value={values['cognito/client-id']}
        />
        <ConfigCard
          title="Users Table"
          value={values['dynamodb/users-table']}
        />
        <ConfigCard
          title="Messages Table"
          value={values['dynamodb/messages-table']}
        />
      </div>
    </div>
  );
}

function ConfigCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <p className="mt-2 font-mono text-xs text-gray-800 break-all">{value}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 4: With Fallback Value
// ============================================

import { useParameterWithFallback } from '@/hooks/useParameter';

export function RedirectButton() {
  // If parameter fails, use localhost as fallback
  const redirectUrl = useParameterWithFallback(
    'app-urls/redirect-sign-in',
    'http://localhost:3000/'
  );

  return (
    <a
      href={redirectUrl}
      className="px-6 py-3 bg-yellow-500 text-sky-900 rounded-lg font-semibold hover:bg-yellow-600"
    >
      Sign In
    </a>
  );
}

// ============================================
// EXAMPLE 5: Cache Management
// ============================================

import { useParameterStoreContext } from '@/lib/parameterStore/ParameterStoreContext';

export function CacheControlPanel() {
  const { clearCache, isInitialized } = useParameterStoreContext();
  const { value, refresh } = useParameter('cognito/user-pool-id');

  const handleClearAll = () => {
    clearCache(); // Clear all cached parameters
    alert('All cache cleared!');
  };

  const handleClearSpecific = () => {
    clearCache('cognito/user-pool-id'); // Clear specific parameter
    alert('User Pool ID cache cleared!');
  };

  const handleRefresh = async () => {
    await refresh(); // Force refresh from AWS
    alert('Parameter refreshed!');
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">Cache Control</h2>

      <div className="flex items-center gap-2">
        <span className="text-sm">Status:</span>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            isInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {isInitialized ? 'Connected' : 'Not Initialized'}
        </span>
      </div>

      <div className="space-x-2">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Parameter
        </button>
        <button
          onClick={handleClearSpecific}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Clear Specific Cache
        </button>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Cache
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">Current User Pool ID:</p>
        <p className="font-mono text-xs mt-1">{value}</p>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Updated Amplify Config
// ============================================

// src/lib/amplify/amplify-config-dynamic.ts
'use client';

import { Amplify, type ResourcesConfig } from 'aws-amplify';
import { useEffect } from 'react';
import { useParameters } from '@/hooks/useParameter';

/**
 * Dynamic Amplify Configuration Component
 * Fetches config from Parameter Store and initializes Amplify
 */
export function DynamicAmplifyConfig({ children }: { children: React.ReactNode }) {
  const { values, loading, error } = useParameters([
    'cognito/user-pool-id',
    'cognito/client-id',
  ]);

  useEffect(() => {
    if (!loading && !error && values) {
      const authConfig: ResourcesConfig['Auth'] = {
        Cognito: {
          userPoolId: values['cognito/user-pool-id'],
          userPoolClientId: values['cognito/client-id'],
          loginWith: {
            email: true,
          },
          signUpVerificationMethod: 'code',
          userAttributes: {
            email: {
              required: true,
            },
            given_name: {
              required: true,
            },
            family_name: {
              required: false,
            },
          },
          passwordFormat: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialCharacters: true,
          },
        },
      };

      Amplify.configure({
        Auth: authConfig,
      });

      console.log('[Amplify] Configured with Parameter Store values');
    }
  }, [values, loading, error]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Loading configuration...</div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600">Failed to load configuration: {error.message}</div>
    </div>;
  }

  return <>{children}</>;
}

// ============================================
// EXAMPLE 7: API Route Usage (Server-side)
// ============================================

// src/app/api/config/route.ts
import { parameterStore } from '@/lib/parameterStore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Initialize if not already done
    if (!parameterStore.isInitialized()) {
      parameterStore.initialize({
        region: process.env.AWS_REGION || 'us-east-1',
        environment: 'dev',
        prefix: '/panther-kolab',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      });
    }

    // Fetch multiple parameters
    const config = await parameterStore.getParameters([
      'cognito/user-pool-id',
      'dynamodb/users-table',
      'dynamodb/messages-table',
    ]);

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// EXAMPLE 8: Loading State Component
// ============================================

export function ParameterLoader({ paramKey }: { paramKey: ParameterKey }) {
  const { value, loading, error } = useParameter(paramKey);

  return (
    <div className="p-4 border rounded">
      <h4 className="font-semibold mb-2">{paramKey}</h4>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="animate-spin">⏳</div>
          <span className="text-gray-600">Loading...</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">
          Error: {error.message}
        </div>
      )}

      {value && (
        <div className="font-mono text-sm text-gray-800 bg-gray-50 p-2 rounded break-all">
          {value}
        </div>
      )}
    </div>
  );
}

// Usage
export function AllParametersView() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ParameterLoader paramKey="cognito/user-pool-id" />
      <ParameterLoader paramKey="cognito/client-id" />
      <ParameterLoader paramKey="dynamodb/users-table" />
      <ParameterLoader paramKey="dynamodb/messages-table" />
    </div>
  );
}

// ============================================
// EXAMPLE 9: Error Handling
// ============================================

export function RobustParameterComponent() {
  const { value, loading, error, refresh } = useParameter('cognito/user-pool-id');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // Handle specific error types
    if (error.code === 'PARAMETER_NOT_FOUND') {
      return (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h3 className="font-bold text-yellow-800">Parameter Not Found</h3>
          <p className="text-yellow-700 text-sm">
            This parameter hasn't been created in AWS Parameter Store yet.
          </p>
          <button
            onClick={() => window.open('/docs/setup', '_blank')}
            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded"
          >
            View Setup Guide
          </button>
        </div>
      );
    }

    if (error.code === 'ACCESS_DENIED') {
      return (
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <h3 className="font-bold text-red-800">Access Denied</h3>
          <p className="text-red-700 text-sm">
            Your AWS credentials don't have permission to access this parameter.
          </p>
          <p className="text-red-600 text-xs mt-2">
            Contact your admin to grant SSM read permissions.
          </p>
        </div>
      );
    }

    // Generic error
    return (
      <div className="bg-red-50 p-4 rounded border border-red-200">
        <h3 className="font-bold text-red-800">Error</h3>
        <p className="text-red-700 text-sm">{error.message}</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <div>Value: {value}</div>;
}
