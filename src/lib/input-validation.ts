import { z } from 'zod';
import { NextRequest } from 'next/server';

// Simple HTML sanitization (basic implementation without external dependency)
function basicHtmlSanitize(html: string, allowedTags: string[] = []): string {
  // Remove script tags and their content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  cleaned = cleaned.replace(/\s(on\w+|javascript:|data:)\s*=\s*["'][^"']*["']/gi, '');
  
  // If no allowed tags specified, strip all HTML
  if (allowedTags.length === 0) {
    return cleaned.replace(/<[^>]*>/g, '');
  }
  
  // Remove tags not in allowedTags list
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;
  cleaned = cleaned.replace(tagPattern, (match, tagName) => {
    return allowedTags.includes(tagName.toLowerCase()) ? match : '';
  });
  
  return cleaned.trim();
}

// Input validation schemas
export const ValidationSchemas = {
  // User input validation
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),

  email: z.string()
    .email('Invalid email address')
    .max(254, 'Email address is too long'), // RFC 5321 limit

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  // Content validation
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .transform(val => val?.trim()),

  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content is too long') // ~10 pages of text
    .trim(),

  tags: z.array(z.string()
    .min(1, 'Tag cannot be empty')
    .max(50, 'Tag is too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Tags can only contain letters, numbers, hyphens, and underscores'))
    .max(10, 'Maximum 10 tags allowed'),

  // File upload validation
  fileName: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename is too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename characters'),

  fileSize: z.number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'), // 10MB limit

  // API parameters
  id: z.string()
    .uuid('Invalid ID format'),

  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),

  page: z.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .max(1000, 'Page number is too high'),

  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100'),

  // Search and filtering
  searchQuery: z.string()
    .max(200, 'Search query is too long')
    .optional()
    .transform(val => val?.trim()),

  sortOrder: z.enum(['asc', 'desc']).optional(),

  sortBy: z.enum(['created_at', 'updated_at', 'title', 'rating']).optional(),

  // User preferences
  theme: z.enum(['light', 'dark', 'system']),

  language: z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh']),

  timezone: z.string()
    .regex(/^[A-Za-z_/]+$/, 'Invalid timezone format'),

  // Security-sensitive fields
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),

  csrf: z.string()
    .min(32, 'Invalid CSRF token')
    .max(128, 'CSRF token is too long'),

  // URL validation
  url: z.string()
    .url('Invalid URL format')
    .max(2000, 'URL is too long'),

  // Rich text content
  richText: z.string()
    .max(100000, 'Content is too long') // Allow larger rich text
    .transform(val => sanitizeHtml(val))
};

// Content sanitization functions
export function sanitizeHtml(html: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}): string {
  const allowedTags = options?.allowedTags || [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'
  ];

  return basicHtmlSanitize(html, allowedTags);
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .trim();
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 255); // Limit length
}

// SQL injection prevention (for raw queries - normally Prisma handles this)
export function sanitizeSqlString(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove SQL injection characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments start
    .replace(/\*\//g, '') // Remove SQL block comments end
    .trim();
}

// XSS prevention for attribute values
export function sanitizeAttributeValue(value: string): string {
  return value
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    });
}

// Input validation middleware
export class InputValidator {
  static validateBody<T>(
    schema: z.ZodSchema<T>,
    body: unknown
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.parse(body);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Invalid input format'] };
    }
  }

  static validateQuery<T>(
    schema: z.ZodSchema<T>,
    query: URLSearchParams | Record<string, string | string[]>
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      // Convert URLSearchParams to object if needed
      const queryObject = query instanceof URLSearchParams 
        ? Object.fromEntries(query.entries())
        : query;

      // Convert string values to appropriate types for validation
      const processedQuery = this.processQueryParams(queryObject);
      
      const result = schema.parse(processedQuery);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Invalid query parameters'] };
    }
  }

  private static processQueryParams(query: Record<string, string | string[]>): Record<string, unknown> {
    const processed: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        processed[key] = value;
      } else if (value === 'true' || value === 'false') {
        processed[key] = value === 'true';
      } else if (!isNaN(Number(value)) && value !== '') {
        processed[key] = Number(value);
      } else {
        processed[key] = value;
      }
    }
    
    return processed;
  }

  static validateFile(
    file: File,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: number = 10 * 1024 * 1024 // 10MB
  ): { success: true } | { success: false; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check filename
    const filenameResult = ValidationSchemas.fileName.safeParse(file.name);
    if (!filenameResult.success) {
      errors.push('Invalid filename');
    }

    return errors.length > 0 
      ? { success: false, errors }
      : { success: true };
  }
}

// Security headers validation
export function validateSecurityHeaders(req: NextRequest): {
  isValid: boolean;
  missing: string[];
  recommendations: string[];
} {
  const requiredHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'strict-transport-security'
  ];

  const recommendedHeaders = [
    'content-security-policy',
    'referrer-policy',
    'permissions-policy'
  ];

  const missing = requiredHeaders.filter(header => !req.headers.get(header));
  const recommendations = recommendedHeaders.filter(header => !req.headers.get(header));

  return {
    isValid: missing.length === 0,
    missing,
    recommendations
  };
}

// Request size validation
export function validateRequestSize(
  req: NextRequest,
  maxBodySize: number = 1024 * 1024 // 1MB default
): boolean {
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= maxBodySize;
  }
  return true; // Allow if no content-length header
}

// Path traversal prevention
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[^a-zA-Z0-9\/._-]/g, '') // Only allow safe characters
    .replace(/\/+/g, '/') // Remove multiple slashes
    .replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
}

// Environment-based validation
export function getValidationConfig(): {
  strictMode: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  maxContentLength: number;
} {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    strictMode: !isDev,
    maxFileSize: isDev ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB dev, 10MB prod
    allowedFileTypes: isDev 
      ? ['image/*', 'text/*', 'application/json']
      : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxContentLength: isDev ? 10 * 1024 * 1024 : 1024 * 1024 // 10MB dev, 1MB prod
  };
}