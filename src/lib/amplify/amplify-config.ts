'use client'

import { Amplify, type ResourcesConfig } from "aws-amplify";
import { useEffect } from "react";

export const authConfig: ResourcesConfig["Auth"] = {
  Cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    loginWith: {
      email: true,
    },
    signUpVerificationMethod: "code",
    userAttributes: {
      email: {
        required: true,
      },
      given_name: {
        required: true,
      },
      family_name: {
        required: false
      }
    },
    passwordFormat: {
      minLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialCharacters: true,
    },
  },
}

// Configure immediately on module load
if (typeof window !== 'undefined') {
  console.log('🔧 Configuring Amplify...');
  console.log('User Pool ID:', process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
  console.log('Client ID:', process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID);
  
  Amplify.configure(
    {
      Auth: authConfig
    },
    {
      ssr: true
    }
  );
  
  console.log('✅ Amplify configured');
}

export function ConfigureAmplifyClientSide() {
  useEffect(() => {
    console.log('🔄 ConfigureAmplifyClientSide running');
    console.log('User Pool ID:', process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
    console.log('Client ID:', process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID);
    
    if (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 
        !process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID) {
      console.error('❌ Missing environment variables!');
      return;
    }
    
    Amplify.configure(
      {
        Auth: authConfig
      },
      {
        ssr: true
      }
    );
    
    console.log('✅ Amplify reconfigured in useEffect');
  }, []);
  
  return null;
}

export default Amplify;