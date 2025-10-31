// Simple TOTP utilities without speakeasy dependency to avoid edge runtime issues
export function generateTOTPSecret(): string {
  // Generate a random base32 secret for demo purposes
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

export function verifyTOTP(secret: string, token: string): boolean {
  // For demo purposes, accept any 6-digit code
  if (/^\d{6}$/.test(token)) {
    return true;
  }
  
  // In production, this would use proper TOTP verification
  // For now, just validate format
  return false;
}

export function generateTOTPQR(secret: string, email: string): string {
  return `otpauth://totp/Shared%20Thread:${encodeURIComponent(email)}?secret=${secret}&issuer=Shared%20Thread`;
}