import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sendUserEmail } from '@/lib/email-service';
import { sendUserSMS } from '@/lib/sms-service';
import { rateLimit, getClientIP, resetRateLimit } from '@/lib/rate-limit';
import { logError } from '@/lib/error-logger';


const signupSchema = z.object({
  username: z.string().min(3).max(30),
  displayName: z.string().min(2).max(100),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  password: z.string().min(8),
  birthday: z.string(),
  pronouns: z.string().optional(),
  newsletterOptIn: z.boolean().default(false),
  smsOptIn: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 signups per 15 minutes per IP (stricter than login)
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(clientIP, 3, 15 * 60 * 1000);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.reset);
      return NextResponse.json({
        error: `Too many signup attempts. Please try again after ${resetDate.toLocaleTimeString()}.`
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        }
      });
    }

    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if email already exists
    const existingEmail = await prisma.users.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { 
          error: 'An account with this email already exists. Please log in instead.', 
          redirect: 'login' 
        },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    if (validatedData.phoneNumber) {
      const existingPhone = await prisma.users.findUnique({
        where: { phoneNumber: validatedData.phoneNumber },
      });

      if (existingPhone) {
        return NextResponse.json(
          { 
            error: 'An account with this phone number already exists. Please log in instead.', 
            redirect: 'login' 
          },
          { status: 400 }
        );
      }
    }

    // Check if username is taken
    const existingUsername = await prisma.users.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 400 }
      );
    }

    // Calculate age from birthday
    const birthDate = new Date(validatedData.birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const isOver18 = age >= 18;
    const onWaitlist = !isOver18;

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Determine role - first user is admin
    const userCount = await prisma.users.count();
    const role = userCount === 0 ? 'ADMIN' : 'MEMBER';

    // Create user
    const user = await prisma.users.create({
      data: {
        username: validatedData.username,
        displayName: validatedData.displayName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        password: hashedPassword,
        birthday: birthDate,
        pronouns: validatedData.pronouns || null,
        role,
        isOver18,
        onWaitlist,
        waitlistReason: onWaitlist ? 'Under 18 years old' : null,
        agreedToTerms: true,
        newsletterSubscribed: validatedData.newsletterOptIn,
        smsOptIn: validatedData.smsOptIn,
        // All new users need staff approval (except first admin)
        isApproved: role === 'ADMIN',
      },
    });

    // Send welcome email (non-blocking)
    try {
      await sendUserEmail('welcome', user.email, {
        displayName: user.displayName,
        username: user.username,
      });
    } catch (emailError) {
      logError('Failed to send welcome email:', emailError);
      // Don't fail signup if email fails
    }

    // Send welcome SMS if user opted in (non-blocking)
    if (user.smsOptIn && user.phoneNumber) {
      try {
        await sendUserSMS('welcome', user.phoneNumber, {
          displayName: user.displayName,
        });
      } catch (smsError) {
        logError('Failed to send welcome SMS:', smsError);
        // Don't fail signup if SMS fails
      }
    }

    // Reset rate limit on successful signup
    resetRateLimit(clientIP);

    return NextResponse.json({
      success: true,
      userId: user.id,
      username: user.username,
      onWaitlist,
      message: onWaitlist 
        ? 'Account created! You\'ve been added to the waitlist and will be notified when you can join.'
        : 'Account created successfully! Please log in.',
    });
  } catch (error) {
    logError('Enhanced signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
