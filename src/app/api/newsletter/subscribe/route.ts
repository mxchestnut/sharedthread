import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


const newsletterSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);

    // Check if email already exists in our users table
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Update existing user's newsletter preference
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { newsletterSubscribed: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Newsletter subscription updated for your account!',
      });
    }

    // For non-users, we could store in a separate newsletter_subscribers table
    // For now, we'll just log it and return success
    console.log('Newsletter subscription for non-user:', {
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      source: 'header_signup',
    });

    // TODO: Add to external newsletter service (Buttondown, ConvertKit, etc.)
    // TODO: Store in newsletter_subscribers table for non-users
    // TODO: Send welcome email

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    });

  } catch (error) {
    logError('Newsletter subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid email address',
          details: error.issues.map(issue => issue.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter. Please try again.' },
      { status: 500 }
    );
  }
}