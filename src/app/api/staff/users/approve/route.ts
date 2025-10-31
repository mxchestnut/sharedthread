import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendUserEmail } from '@/lib/email-service';
import { sendUserSMS } from '@/lib/sms-service';
import { logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper auth verification
    // For now, assuming this is called by authenticated admin users

    const body = await request.json();
    const { userId, approve, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (approve) {
      // Approve the user
      await prisma.users.update({
        where: { id: userId },
        data: {
          isApproved: true,
          onWaitlist: false, // Remove from waitlist if they were on it
        },
      });

      // Send approval email
      try {
        await sendUserEmail('approval', user.email, {
          displayName: user.displayName,
        });
      } catch (emailError) {
        logError('Failed to send approval email:', emailError);
        // Don't fail the approval if email fails
      }

      // Send approval SMS if user opted in
      if (user.smsOptIn && user.phoneNumber) {
        try {
          await sendUserSMS('approval', user.phoneNumber, {
            displayName: user.displayName,
          });
        } catch (smsError) {
          logError('Failed to send approval SMS:', smsError);
          // Don't fail the approval if SMS fails
        }
      }

      return NextResponse.json({
        success: true,
        message: 'User approved successfully',
      });
    } else {
      // Deny the user - for now we'll just mark them as not approved
      // In the future, we might want to add a 'denied' status
      await prisma.users.update({
        where: { id: userId },
        data: {
          isApproved: false,
          onWaitlist: false,
          // We could store the denial reason if we add a field for it
        },
      });

      // Send denial email
      try {
        await sendUserEmail('denial', user.email, {
          displayName: user.displayName,
          denialReason: reason,
        });
      } catch (emailError) {
        logError('Failed to send denial email:', emailError);
        // Don't fail the denial if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'User denied',
        reason,
      });
    }
  } catch (error) {
    logError('User approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process user approval' },
      { status: 500 }
    );
  }
}
