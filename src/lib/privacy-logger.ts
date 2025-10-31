import crypto from 'crypto';

// Log levels with privacy impact
export enum LogLevel {
  TRACE = 0,    // Development only, never in production
  DEBUG = 1,    // Development only, disabled in production
  INFO = 2,     // Minimal personal data, high business value
  WARN = 3,     // Security relevance, limited personal data
  ERROR = 4,    // Essential for operation, data minimized
  CRITICAL = 5  // Security events, temporary personal data allowed
}

// Data classification for privacy protection
export enum DataClassification {
  PUBLIC = 'public',         // Can be logged freely
  INTERNAL = 'internal',     // Business logic, no personal data
  CONFIDENTIAL = 'confidential', // Must be hashed/anonymized
  RESTRICTED = 'restricted'  // Never logged
}

// Audit action types
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PERMISSION_CHANGE = 'permission_change',
  CONTENT_MODERATE = 'content_moderate',
  PRIVACY_SETTING = 'privacy_setting'
}

// Log entry interface
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  metadata: Record<string, unknown>;
  userId?: string; // Hashed after retention period
  sessionId?: string; // Hashed immediately
  ipHash: string; // Always hashed
  userAgent?: string; // Sanitized
  classification: DataClassification;
  retentionPolicy: RetentionPolicy;
  anonymized: boolean;
}

// Audit trail entry
export interface AuditEvent {
  id: string;
  timestamp: number;
  userId: string; // Hashed after retention period
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  ipHash: string;
  userAgent: string;
  success: boolean;
  retentionPolicy: RetentionPolicy;
}

// Retention policies
export interface RetentionPolicy {
  category: string;
  retentionDays: number;
  anonymizationSchedule: AnonymizationSchedule[];
  gdprImpact: 'high' | 'medium' | 'low' | 'none';
}

export interface AnonymizationSchedule {
  afterDays: number;
  action: 'hash' | 'remove' | 'aggregate' | 'delete';
  fields: string[];
}

// Default retention policies
export const RETENTION_POLICIES: Record<string, RetentionPolicy> = {
  security: {
    category: 'security',
    retentionDays: 90,
    anonymizationSchedule: [
      { afterDays: 1, action: 'hash', fields: ['ip', 'userAgent'] },
      { afterDays: 7, action: 'hash', fields: ['userId'] },
      { afterDays: 30, action: 'aggregate', fields: ['metadata'] }
    ],
    gdprImpact: 'high'
  },
  authentication: {
    category: 'authentication',
    retentionDays: 30,
    anonymizationSchedule: [
      { afterDays: 1, action: 'hash', fields: ['ip'] },
      { afterDays: 7, action: 'hash', fields: ['userId'] }
    ],
    gdprImpact: 'medium'
  },
  audit: {
    category: 'audit',
    retentionDays: 365,
    anonymizationSchedule: [
      { afterDays: 0, action: 'hash', fields: ['ip'] },
      { afterDays: 30, action: 'hash', fields: ['userId'] }
    ],
    gdprImpact: 'high'
  },
  user_activity: {
    category: 'user_activity',
    retentionDays: 7,
    anonymizationSchedule: [
      { afterDays: 0, action: 'hash', fields: ['ip', 'userId'] }
    ],
    gdprImpact: 'medium'
  },
  system: {
    category: 'system',
    retentionDays: 30,
    anonymizationSchedule: [],
    gdprImpact: 'none'
  },
  error: {
    category: 'error',
    retentionDays: 14,
    anonymizationSchedule: [
      { afterDays: 0, action: 'remove', fields: ['personalData'] }
    ],
    gdprImpact: 'low'
  }
};

// Privacy-aware logger
export class PrivacyLogger {
  private static logs: LogEntry[] = [];
  private static auditEvents: AuditEvent[] = [];
  private static hashSalt: string = this.generateDailyHashSalt();
  private static lastSaltUpdate: number = Date.now();

  // Generate a daily rotating salt for IP hashing
  private static generateDailyHashSalt(): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return crypto.createHash('sha256')
      .update(`${process.env.LOG_SALT_SECRET || 'default-secret'}_${today}`)
      .digest('hex');
  }

  // Update salt daily for IP hashing
  private static updateSaltIfNeeded(): void {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now - this.lastSaltUpdate > oneDayMs) {
      this.hashSalt = this.generateDailyHashSalt();
      this.lastSaltUpdate = now;
    }
  }

  // Hash sensitive data
  private static hashSensitiveData(data: string, persistent = false): string {
    if (persistent) {
      // Use a persistent hash for correlation across sessions
      return crypto.createHash('sha256')
        .update(`${process.env.LOG_HASH_SECRET || 'persistent-secret'}_${data}`)
        .digest('hex')
        .substring(0, 16); // Use first 16 chars for storage efficiency
    } else {
      // Use daily rotating salt for IP addresses
      this.updateSaltIfNeeded();
      return crypto.createHash('sha256')
        .update(`${this.hashSalt}_${data}`)
        .digest('hex')
        .substring(0, 12); // Shorter hash for daily rotation
    }
  }

  // Sanitize user agent string
  private static sanitizeUserAgent(userAgent: string): string {
    if (!userAgent) return 'unknown';
    
    // Extract basic browser and OS info, remove specific versions
    const sanitized = userAgent
      .replace(/\d+\.\d+\.\d+/g, 'X.X.X') // Remove version numbers
      .replace(/\([^)]*\)/g, '(...)') // Remove detailed OS info
      .substring(0, 100); // Limit length
    
    return sanitized;
  }

  // Remove personal data from metadata
  private static sanitizeMetadata(
    metadata: Record<string, unknown>,
    classification: DataClassification
  ): Record<string, unknown> {
    const sanitized = { ...metadata };
    
    // Remove fields that might contain personal data
    const personalDataFields = [
      'email', 'name', 'phone', 'address', 'ssn', 'password',
      'token', 'secret', 'key', 'session', 'cookie'
    ];
    
    if (classification === DataClassification.CONFIDENTIAL || 
        classification === DataClassification.RESTRICTED) {
      personalDataFields.forEach(field => {
        if (sanitized[field]) {
          delete sanitized[field];
        }
      });
    }
    
    // Hash IP addresses if present
    if (sanitized.ip && typeof sanitized.ip === 'string') {
      sanitized.ipHash = this.hashSensitiveData(sanitized.ip);
      delete sanitized.ip;
    }
    
    return sanitized;
  }

  // Create log entry
  static log(
    level: LogLevel,
    category: string,
    message: string,
    metadata: Record<string, unknown> = {},
    classification: DataClassification = DataClassification.INTERNAL,
    userId?: string,
    sessionId?: string,
    ip?: string,
    userAgent?: string
  ): void {
    // Skip trace and debug logs in production
    if (process.env.NODE_ENV === 'production' && level <= LogLevel.DEBUG) {
      return;
    }

    const retentionPolicy = RETENTION_POLICIES[category] || RETENTION_POLICIES.system;
    
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      category,
      message: this.sanitizeMessage(message, classification),
      metadata: this.sanitizeMetadata(metadata, classification),
      userId: userId ? this.hashSensitiveData(userId, true) : undefined,
      sessionId: sessionId ? this.hashSensitiveData(sessionId, true) : undefined,
      ipHash: ip ? this.hashSensitiveData(ip) : 'unknown',
      userAgent: userAgent ? this.sanitizeUserAgent(userAgent) : undefined,
      classification,
      retentionPolicy,
      anonymized: false
    };

    this.logs.push(entry);
    this.enforceRetentionPolicy();
    
    // Output to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${LogLevel[level]}] ${category}: ${message}`, {
        metadata: entry.metadata,
        classification,
        userId: userId ? 'hashed' : undefined
      });
    }
  }

  // Generate unique log ID
  private static generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sanitize log message
  private static sanitizeMessage(message: string, classification: DataClassification): string {
    if (classification === DataClassification.RESTRICTED) {
      return '[RESTRICTED DATA REMOVED]';
    }
    
    // Remove potential personal data patterns
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD]')
      .replace(/\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/g, '[PHONE]');
  }

  // Create audit event
  static audit(
    userId: string,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    metadata: Record<string, unknown> = {},
    ip?: string,
    userAgent?: string,
    success = true
  ): void {
    const event: AuditEvent = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      userId: this.hashSensitiveData(userId, true),
      action,
      resource,
      resourceId,
      oldValues: this.sanitizeMetadata(oldValues || {}, DataClassification.CONFIDENTIAL),
      newValues: this.sanitizeMetadata(newValues || {}, DataClassification.CONFIDENTIAL),
      metadata: this.sanitizeMetadata(metadata, DataClassification.CONFIDENTIAL),
      ipHash: ip ? this.hashSensitiveData(ip) : 'unknown',
      userAgent: userAgent ? this.sanitizeUserAgent(userAgent) : 'unknown',
      success,
      retentionPolicy: RETENTION_POLICIES.audit
    };

    this.auditEvents.push(event);
    this.enforceRetentionPolicy();
    
    // Log as INFO level
    this.log(
      LogLevel.INFO,
      'audit',
      `User ${action} ${resource}`,
      { action, resource, success },
      DataClassification.CONFIDENTIAL,
      userId,
      undefined,
      ip,
      userAgent
    );
  }

  // Convenience methods for different log levels
  static trace(message: string, metadata?: Record<string, unknown>, userId?: string): void {
    this.log(LogLevel.TRACE, 'debug', message, metadata, DataClassification.INTERNAL, userId);
  }

  static debug(message: string, metadata?: Record<string, unknown>, userId?: string): void {
    this.log(LogLevel.DEBUG, 'debug', message, metadata, DataClassification.INTERNAL, userId);
  }

  static info(message: string, metadata?: Record<string, unknown>, userId?: string): void {
    this.log(LogLevel.INFO, 'info', message, metadata, DataClassification.INTERNAL, userId);
  }

  static warn(message: string, metadata?: Record<string, unknown>, userId?: string): void {
    this.log(LogLevel.WARN, 'warning', message, metadata, DataClassification.CONFIDENTIAL, userId);
  }

  static error(message: string, metadata?: Record<string, unknown>, userId?: string): void {
    this.log(LogLevel.ERROR, 'error', message, metadata, DataClassification.CONFIDENTIAL, userId);
  }

  static critical(message: string, metadata?: Record<string, unknown>, userId?: string): void {
    this.log(LogLevel.CRITICAL, 'security', message, metadata, DataClassification.CONFIDENTIAL, userId);
  }

  // Security-specific logging methods
  static security(
    event: string,
    metadata: Record<string, unknown> = {},
    userId?: string,
    ip?: string,
    userAgent?: string
  ): void {
    this.log(
      LogLevel.CRITICAL,
      'security',
      `Security event: ${event}`,
      metadata,
      DataClassification.CONFIDENTIAL,
      userId,
      undefined,
      ip,
      userAgent
    );
  }

  static authentication(
    event: string,
    userId?: string,
    ip?: string,
    userAgent?: string,
    success = true
  ): void {
    this.log(
      success ? LogLevel.INFO : LogLevel.WARN,
      'authentication',
      `Auth event: ${event}`,
      { success },
      DataClassification.CONFIDENTIAL,
      userId,
      undefined,
      ip,
      userAgent
    );
  }

  // Enforce retention policies
  private static enforceRetentionPolicy(): void {
    const now = Date.now();
    
    // Clean up logs
    this.logs = this.logs.filter(log => {
      const age = now - log.timestamp;
      const retentionMs = log.retentionPolicy.retentionDays * 24 * 60 * 60 * 1000;
      return age < retentionMs;
    });
    
    // Clean up audit events
    this.auditEvents = this.auditEvents.filter(event => {
      const age = now - event.timestamp;
      const retentionMs = event.retentionPolicy.retentionDays * 24 * 60 * 60 * 1000;
      return age < retentionMs;
    });
    
    // Apply anonymization schedules
    this.applyAnonymization();
  }

  // Apply anonymization based on age
  private static applyAnonymization(): void {
    const now = Date.now();
    
    this.logs.forEach(log => {
      log.retentionPolicy.anonymizationSchedule.forEach(schedule => {
        const ageMs = now - log.timestamp;
        const scheduleMs = schedule.afterDays * 24 * 60 * 60 * 1000;
        
        if (ageMs >= scheduleMs && !log.anonymized) {
          schedule.fields.forEach(field => {
            if (log[field as keyof LogEntry]) {
              switch (schedule.action) {
                case 'hash':
                  // Already hashed during creation
                  break;
                case 'remove':
                  // Remove specific fields based on anonymization schedule
                  if (field === 'userId') log.userId = undefined;
                  else if (field === 'sessionId') log.sessionId = undefined;
                  else if (field === 'userAgent') log.userAgent = undefined;
                  break;
                case 'aggregate':
                  // Convert to aggregated form
                  if (field === 'metadata') {
                    log.metadata = { aggregated: true };
                  }
                  break;
              }
            }
          });
          log.anonymized = true;
        }
      });
    });
  }

  // Get logs for a user (GDPR right to access)
  static getUserLogs(userId: string): {
    logs: LogEntry[];
    auditEvents: AuditEvent[];
  } {
    const hashedUserId = this.hashSensitiveData(userId, true);
    
    const userLogs = this.logs.filter(log => log.userId === hashedUserId);
    const userAuditEvents = this.auditEvents.filter(event => event.userId === hashedUserId);
    
    return {
      logs: userLogs,
      auditEvents: userAuditEvents
    };
  }

  // Delete user logs (GDPR right to erasure)
  static deleteUserLogs(userId: string): {
    logsDeleted: number;
    auditEventsDeleted: number;
  } {
    const hashedUserId = this.hashSensitiveData(userId, true);
    
    const initialLogCount = this.logs.length;
    const initialAuditCount = this.auditEvents.length;
    
    // Remove user logs
    this.logs = this.logs.filter(log => log.userId !== hashedUserId);
    this.auditEvents = this.auditEvents.filter(event => event.userId !== hashedUserId);
    
    const logsDeleted = initialLogCount - this.logs.length;
    const auditEventsDeleted = initialAuditCount - this.auditEvents.length;
    
    // Log the deletion for compliance
    this.audit(
      'system',
      AuditAction.DELETE,
      'user_logs',
      userId,
      undefined,
      { logsDeleted, auditEventsDeleted },
      { gdprRequest: true, automated: true }
    );
    
    return { logsDeleted, auditEventsDeleted };
  }

  // Get analytics (aggregated, anonymous)
  static getAnalytics(category?: string, days = 30): {
    logCounts: Record<string, number>;
    levelDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    retentionCompliance: boolean;
  } {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentLogs = this.logs.filter(log => log.timestamp >= cutoff);
    
    const filtered = category 
      ? recentLogs.filter(log => log.category === category)
      : recentLogs;
    
    const logCounts: Record<string, number> = {};
    const levelDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};
    
    filtered.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      logCounts[date] = (logCounts[date] || 0) + 1;
      
      const level = LogLevel[log.level];
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
      
      categoryDistribution[log.category] = (categoryDistribution[log.category] || 0) + 1;
    });
    
    // Check retention compliance
    const retentionCompliance = this.checkRetentionCompliance();
    
    return {
      logCounts,
      levelDistribution,
      categoryDistribution,
      retentionCompliance
    };
  }

  // Check retention policy compliance
  private static checkRetentionCompliance(): boolean {
    const now = Date.now();
    
    return this.logs.every(log => {
      const age = now - log.timestamp;
      const maxRetention = log.retentionPolicy.retentionDays * 24 * 60 * 60 * 1000;
      return age <= maxRetention;
    });
  }

  // Export logs for compliance
  static exportLogs(format: 'json' | 'csv' = 'json'): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      retentionPolicies: RETENTION_POLICIES,
      logs: this.logs.map(log => ({
        ...log,
        timestampISO: new Date(log.timestamp).toISOString()
      })),
      auditEvents: this.auditEvents.map(event => ({
        ...event,
        timestampISO: new Date(event.timestamp).toISOString()
      })),
      analytics: this.getAnalytics()
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else {
      // Simple CSV export for logs
      const headers = ['timestamp', 'level', 'category', 'message', 'classification'];
      const csvRows = [headers.join(',')];
      
      this.logs.forEach(log => {
        const row = [
          new Date(log.timestamp).toISOString(),
          LogLevel[log.level],
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          log.classification
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    }
  }

  // Get current log statistics
  static getStatistics(): {
    totalLogs: number;
    totalAuditEvents: number;
    retentionCompliance: boolean;
    oldestLog: string;
    newestLog: string;
    categoryCounts: Record<string, number>;
  } {
    const categoryCounts: Record<string, number> = {};
    this.logs.forEach(log => {
      categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
    });
    
    const timestamps = this.logs.map(log => log.timestamp);
    const oldestTimestamp = Math.min(...timestamps);
    const newestTimestamp = Math.max(...timestamps);
    
    return {
      totalLogs: this.logs.length,
      totalAuditEvents: this.auditEvents.length,
      retentionCompliance: this.checkRetentionCompliance(),
      oldestLog: new Date(oldestTimestamp).toISOString(),
      newestLog: new Date(newestTimestamp).toISOString(),
      categoryCounts
    };
  }

  // Cleanup method for maintenance
  static async performCleanup(): Promise<number> {
    let cleanedCount = 0;
    
    // Clean up logs based on retention policies
    const now = Date.now();
    
    // Security logs: 90 days
    const securityCutoff = now - (90 * 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => {
      if (log.category === 'security' && log.timestamp < securityCutoff) {
        cleanedCount++;
        return false;
      }
      return true;
    });
    
    // Activity logs: 7 days
    const activityCutoff = now - (7 * 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => {
      if (log.category === 'user_activity' && log.timestamp < activityCutoff) {
        cleanedCount++;
        return false;
      }
      return true;
    });
    
    // System logs: 30 days
    const systemCutoff = now - (30 * 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => {
      if ((log.category === 'system_error' || log.category === 'system_maintenance') && log.timestamp < systemCutoff) {
        cleanedCount++;
        return false;
      }
      return true;
    });
    
    // Clean up audit events (same retention periods)
    this.auditEvents = this.auditEvents.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      
      if (event.resource === 'security' && eventTime < securityCutoff) {
        cleanedCount++;
        return false;
      }
      if ((event.resource === 'authentication' || event.resource === 'data_access') && eventTime < activityCutoff) {
        cleanedCount++;
        return false;
      }
      if (event.resource === 'system' && eventTime < systemCutoff) {
        cleanedCount++;
        return false;
      }
      
      return true;
    });
    
    return cleanedCount;
  }
}