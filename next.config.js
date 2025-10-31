/**
 * Next.js configuration with Sentry error monitoring
 */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Skip linting during build for deployment
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during build for deployment
  },
  experimental: {
    instrumentationHook: true,
  },
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  
  // Organization and project from Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);