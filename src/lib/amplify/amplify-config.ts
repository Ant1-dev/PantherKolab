/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

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

// Configure immediately on module load
if (typeof window !== "undefined") {
  process.env.NODE_ENV != "production" &&
    console.log("User Pool ID:", process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);

  process.env.NODE_ENV != "production" &&
    console.log("Client ID:", process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID);

  Amplify.configure(
    {
      Auth: authConfig,
    },
    {
      ssr: true,
    }
  );

  process.env.NODE_ENV != "production" && console.log("✅ Amplify configured");
}

export function ConfigureAmplifyClientSide() {
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ||
      !process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
    ) {
      process.env.NODE_ENV != "production" &&
        console.error("❌ Missing environment variables!");
      return;
    }

    Amplify.configure(
      {
        Auth: authConfig,
      },
      {
        ssr: true,
      }
    );
  }, []);

  return null;
}

export default Amplify;
