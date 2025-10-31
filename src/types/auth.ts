export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  role: 'member' | 'admin';
  emailVerified: boolean;
  totpSecret?: string;
  passwordHash?: string; // For credential authentication
  isApproved?: boolean; // For admin approval workflow
  reputation?: number; // For community features
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'member' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TOTPVerification {
  sessionId: string;
  totpCode: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  requiresTOTP?: boolean;
  sessionId?: string;
  error?: string;
}