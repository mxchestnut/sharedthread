// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out known non-critical errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'canvas.contentDocument',
    // Random plugins/extensions
    'atomicFindClose',
    // Network errors
    'NetworkError',
    'Failed to fetch',
  ],

  beforeSend(event, hint) {
    // Filter out non-error console logs
    if (event.level === 'log' || event.level === 'info') {
      return null;
    }
    
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error (dev mode - not sent):', hint.originalException || event);
      return null;
    }
    
    return event;
  },
});
