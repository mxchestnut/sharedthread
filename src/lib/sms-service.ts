import { logInfo, logError } from '@/lib/error-logger';

// SMS service configuration for Twilio
const SMS_CONFIG = {
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
};

export type SMSType = 
  | 'welcome'
  | 'approval'
  | 'waitlist_notification'
  | 'status_change'
  | 'important_update';

export interface SMSData {
  to: string;
  message: string;
}

// Send SMS function
export async function sendSMS(smsData: SMSData): Promise<boolean> {
  // Check if Twilio is configured
  if (!SMS_CONFIG.twilioAccountSid || !SMS_CONFIG.twilioAuthToken || !SMS_CONFIG.twilioPhoneNumber) {
    logInfo('📱 SMS sent (development mode):');
    logInfo('To:', smsData.to);
    logInfo('Message:', smsData.message);
    logInfo('---');
    return true;
  }

  try {
    // In production, use Twilio API
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SMS_CONFIG.twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SMS_CONFIG.twilioAccountSid}:${SMS_CONFIG.twilioAuthToken}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        To: smsData.to,
        From: SMS_CONFIG.twilioPhoneNumber!,
        Body: smsData.message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    logError('SMS sending error:', error);
    return false;
  }
}

// SMS template functions
export function generateWelcomeSMS(displayName: string): string {
  return `Welcome to Shared Thread, ${displayName}! Your account has been created. Start exploring at sharedthread.co`;
}

export function generateApprovalSMS(displayName: string): string {
  return `Great news ${displayName}! Your Shared Thread account has been approved. You now have full access to the platform. Sign in at sharedthread.co`;
}

export function generateStatusChangeSMS(displayName: string, newStatus: string): string {
  return `Hi ${displayName}, your Shared Thread account status has been updated to: ${newStatus}. For questions, contact hello@sharedthread.co`;
}

export function generateWaitlistNotificationSMS(displayName: string): string {
  return `Hi ${displayName}! You're now eligible to join Shared Thread. Sign in at sharedthread.co to start creating!`;
}

// Helper function to send specific SMS types
export async function sendUserSMS(
  smsType: SMSType,
  phoneNumber: string,
  userData: {
    displayName: string;
    status?: string;
  }
): Promise<boolean> {
  let message: string;

  switch (smsType) {
    case 'welcome':
      message = generateWelcomeSMS(userData.displayName);
      break;
    case 'approval':
      message = generateApprovalSMS(userData.displayName);
      break;
    case 'status_change':
      message = generateStatusChangeSMS(userData.displayName, userData.status!);
      break;
    case 'waitlist_notification':
      message = generateWaitlistNotificationSMS(userData.displayName);
      break;
    default:
      logError('Unknown SMS type:', smsType);
      return false;
  }

  return await sendSMS({ to: phoneNumber, message });
}