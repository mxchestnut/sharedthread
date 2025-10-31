import { Resend } from 'resend';
import { logInfo, logError } from '@/lib/error-logger';


// Email service configuration
const EMAIL_CONFIG = {
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.FROM_EMAIL || 'hello@sharedthread.co',
  fromName: process.env.FROM_NAME || 'Shared Thread',
};

// Initialize Resend client
const resend = EMAIL_CONFIG.resendApiKey ? new Resend(EMAIL_CONFIG.resendApiKey) : null;

// Email types for different notifications
export type EmailType = 
  | 'welcome'
  | 'approval'
  | 'denial'
  | 'waitlist_notification'
  | 'password_reset'
  | 'status_change'
  | 'newsletter_welcome'
  | 'contact_confirmation';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Send email function using Resend
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!resend) {
      // Development mode - log emails to console
      logInfo('📧 Email sent (development mode):');
      logInfo('To:', emailData.to);
      logInfo('Subject:', emailData.subject);
      logInfo('HTML:', emailData.html);
      logInfo('Text:', emailData.text);
      logInfo('---');
      return true;
    }

    // Send via Resend
    const result = await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    if (result.error) {
      logError('Resend error:', result.error);
      return false;
    }

    logInfo('✅ Email sent via Resend:', result.data?.id);
    return true;
  } catch (error) {
    logError('Email sending error:', error);
    return false;
  }
}

// Email template functions
export function generateWelcomeEmail(displayName: string, username: string): EmailData {
  const subject = 'Welcome to Shared Thread!';
  const html = `
    <h1>Welcome to Shared Thread, ${displayName}!</h1>
    <p>Your account @${username} has been created successfully.</p>
    <p>Start exploring our community and sharing your work!</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/library" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Visit Your Library
      </a>
    </p>
    <p>Best regards,<br>The Shared Thread Team</p>
  `;
  const text = `Welcome to Shared Thread, ${displayName}! Your account @${username} has been created successfully. Visit ${process.env.NEXT_PUBLIC_APP_URL}/library to get started.`;
  
  return { to: '', subject, html, text };
}

export function generateApprovalEmail(displayName: string): EmailData {
  const subject = 'Your Shared Thread account has been approved!';
  const html = `
    <h1>Great news, ${displayName}!</h1>
    <p>Your Shared Thread account has been approved and you now have full access to the platform.</p>
    <p>You can now:</p>
    <ul>
      <li>Create and publish works in your Atelier</li>
      <li>Join community discussions</li>
      <li>Rate and comment on others' work</li>
      <li>Build your profile and connect with creators</li>
    </ul>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/library" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Start Creating
      </a>
    </p>
    <p>Welcome to the community!<br>The Shared Thread Team</p>
  `;
  const text = `Great news, ${displayName}! Your Shared Thread account has been approved. Visit ${process.env.NEXT_PUBLIC_APP_URL}/library to start creating.`;
  
  return { to: '', subject, html, text };
}

export function generateDenialEmail(displayName: string, reason?: string): EmailData {
  const subject = 'Shared Thread Account Application Update';
  const html = `
    <h1>Hello ${displayName},</h1>
    <p>Thank you for your interest in joining Shared Thread.</p>
    <p>After review, we're unable to approve your account at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you have questions or would like to discuss this decision, please contact us at hello@sharedthread.co.</p>
    <p>Best regards,<br>The Shared Thread Team</p>
  `;
  const text = `Hello ${displayName}, Thank you for your interest in Shared Thread. We're unable to approve your account at this time. ${reason ? `Reason: ${reason}` : ''} Contact hello@sharedthread.co for questions.`;
  
  return { to: '', subject, html, text };
}

export function generatePasswordResetEmail(displayName: string, resetToken: string): EmailData {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
  const subject = 'Reset your Shared Thread password';
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hello ${displayName},</p>
    <p>You requested to reset your Shared Thread password. Click the button below to create a new password:</p>
    <p>
      <a href="${resetUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
    </p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't request this reset, you can safely ignore this email.</p>
    <p>Best regards,<br>The Shared Thread Team</p>
  `;
  const text = `Password reset request for ${displayName}. Visit ${resetUrl} to reset your password. Link expires in 24 hours.`;
  
  return { to: '', subject, html, text };
}

export function generateStatusChangeEmail(displayName: string, newStatus: string): EmailData {
  const subject = `Your Shared Thread account status has been updated`;
  const html = `
    <h1>Account Status Update</h1>
    <p>Hello ${displayName},</p>
    <p>Your account status has been changed to: <strong>${newStatus}</strong></p>
    ${newStatus === 'SUSPENDED' ? `
      <p>Your account has been temporarily suspended. You will not be able to post or comment during this time.</p>
    ` : ''}
    ${newStatus === 'WARNED' ? `
      <p>This is a warning regarding your account activity. Please review our community guidelines.</p>
    ` : ''}
    <p>If you have questions about this change, please contact us at hello@sharedthread.co.</p>
    <p>Best regards,<br>The Shared Thread Team</p>
  `;
  const text = `Hello ${displayName}, your account status has been changed to: ${newStatus}. Contact hello@sharedthread.co for questions.`;
  
  return { to: '', subject, html, text };
}

export function generateWaitlistNotificationEmail(displayName: string): EmailData {
  const subject = "You're eligible to join Shared Thread!";
  const html = `
    <h1>Welcome to Shared Thread, ${displayName}!</h1>
    <p>Great news! You're now eligible to join our community.</p>
    <p>Your account has been moved off the waitlist and you can now access all features.</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Sign In Now
      </a>
    </p>
    <p>We're excited to see what you'll create!<br>The Shared Thread Team</p>
  `;
  const text = `Welcome ${displayName}! You're now eligible to join Shared Thread. Sign in at ${process.env.NEXT_PUBLIC_APP_URL}/login`;
  
  return { to: '', subject, html, text };
}

// Helper function to send specific email types
export async function sendUserEmail(
  emailType: EmailType,
  userEmail: string,
  userData: {
    displayName: string;
    username?: string;
    resetToken?: string;
    status?: string;
    denialReason?: string;
  }
): Promise<boolean> {
  let emailData: EmailData;

  switch (emailType) {
    case 'welcome':
      emailData = generateWelcomeEmail(userData.displayName, userData.username!);
      break;
    case 'approval':
      emailData = generateApprovalEmail(userData.displayName);
      break;
    case 'denial':
      emailData = generateDenialEmail(userData.displayName, userData.denialReason);
      break;
    case 'password_reset':
      emailData = generatePasswordResetEmail(userData.displayName, userData.resetToken!);
      break;
    case 'status_change':
      emailData = generateStatusChangeEmail(userData.displayName, userData.status!);
      break;
    case 'waitlist_notification':
      emailData = generateWaitlistNotificationEmail(userData.displayName);
      break;
    default:
      logError('Unknown email type:', emailType);
      return false;
  }

  emailData.to = userEmail;
  return await sendEmail(emailData);
}