// Database health check utility
import { prisma } from './prisma';
import { logError, logWarning } from '@/lib/error-logger';


let dbHealthy = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

export async function checkDatabaseHealth(): Promise<boolean> {
  const now = Date.now();
  
  // Only check health every 30 seconds to avoid spamming
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL && dbHealthy) {
    return dbHealthy;
  }
  
  try {
    // Simple ping to database
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
    lastHealthCheck = now;
    return true;
  } catch (error) {
    logError('Database health check failed:', error);
    dbHealthy = false;
    lastHealthCheck = now;
    return false;
  }
}

export function isDatabaseHealthy(): boolean {
  return dbHealthy;
}

// Graceful database operation wrapper
export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T | (() => T)
): Promise<T> {
  try {
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      logWarning('Database unavailable, using fallback');
      return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
    }
    
    return await operation();
  } catch (error) {
    logError('Database operation failed, using fallback:', error);
    dbHealthy = false;
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}