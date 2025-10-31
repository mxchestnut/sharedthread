/**
 * Centralized error logging utility for Shared Thread
 * 
 * This module provides a consistent way to log errors throughout the application
 * and automatically sends them to Sentry in production.
 * 
 * Usage:
 *   import { logError, logWarning, logInfo } from '@/lib/error-logger';
 *   
 *   try {
 *     // your code
 *   } catch (error) {
 *     logError('Failed to process request', error, { userId: user.id });
 *   }
 */

import * as Sentry from '@sentry/nextjs';

export type ErrorContext = {
  userId?: string;
  workId?: string;
  communityId?: string;
  apiRoute?: string;
  [key: string]: unknown;
};

/**
 * Log an error to Sentry (production) and console (development)
 */
export function logError(
  message: string,
  error?: unknown,
  context?: ErrorContext
): void {
  // Always log to console
  console.error(`[ERROR] ${message}`, error, context);
  
  // Skip Sentry in development unless explicitly enabled
  const forceSentry = process.env.NEXT_PUBLIC_FORCE_SENTRY === 'true';
  if (process.env.NODE_ENV === 'development' && !forceSentry) {
    return;
  }

  // In production (or when forced), send to Sentry
  Sentry.withScope((scope) => {
    // Add context data
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, { value });
      });
    }

    // Log the error
    if (error instanceof Error) {
      Sentry.captureException(error, {
        level: 'error',
        contexts: {
          trace: {
            message,
          },
        },
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        contexts: {
          error: {
            details: error,
          },
        },
      });
    }
  });

  // Also log to console for CloudWatch/Azure logs
  console.error(`[ERROR] ${message}`, error);
}

/**
 * Log a warning to Sentry (production) and console (development)
 */
export function logWarning(
  message: string,
  data?: unknown,
  context?: ErrorContext
): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[WARN] ${message}`, data, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, { value });
      });
    }

    Sentry.captureMessage(message, {
      level: 'warning',
      contexts: {
        data: {
          details: data,
        },
      },
    });
  });

  console.warn(`[WARN] ${message}`, data);
}

/**
 * Log informational message (only in production for tracking)
 */
export function logInfo(
  message: string,
  data?: unknown,
  context?: ErrorContext
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[INFO] ${message}`, data, context);
    return;
  }

  // In production, only log significant info events to Sentry
  // Most info logs should just go to console
  console.log(`[INFO] ${message}`, data);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Track a custom event/metric
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EVENT] ${eventName}`, properties);
    return;
  }

  Sentry.captureMessage(eventName, {
    level: 'info',
    contexts: {
      event: properties || {},
    },
  });
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: ErrorContext): void {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, { value });
      });
    }
    Sentry.captureException(error);
  });

  console.error('[EXCEPTION]', error, context);
}
