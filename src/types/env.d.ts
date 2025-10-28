/**
 * Type definitions for environment variables
 */

declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const SUPABASE_SERVICE_ROLE_KEY: string;

  export const CLOUDFLARE_R2_ACCOUNT_ID: string;
  export const CLOUDFLARE_R2_ACCESS_KEY_ID: string;
  export const CLOUDFLARE_R2_SECRET_ACCESS_KEY: string;
  export const CLOUDFLARE_R2_BUCKET_NAME: string;
  export const CLOUDFLARE_R2_PUBLIC_URL: string;

  export const EXPO_PUBLIC_API_URL: string;
  export const EXPO_PUBLIC_ENV: 'development' | 'staging' | 'production';

  export const FIREBASE_API_KEY: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;

  export const REDIS_URL: string;
  export const REDIS_PASSWORD: string;

  export const SENTRY_DSN: string;
  export const SENTRY_ORG: string;
  export const SENTRY_PROJECT: string;

  export const JWT_SECRET: string;
  export const ENCRYPTION_KEY: string;

  export const DEBUG: string;
  export const LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}
