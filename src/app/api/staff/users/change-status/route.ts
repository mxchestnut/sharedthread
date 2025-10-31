import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendUserEmail } from '@/lib/email-service';
import { sendUserSMS } from '@/lib/sms-service';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


const VALID_STATUSES = ['ACTIVE', 'WARNED', 'SUSPENDED', 'BANNED'];

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE, WARNED, SUSPENDED, or BANNED' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admins from banning themselves
    if (userId === currentUser.id && status === 'BANNED') {
      return NextResponse.json(
        { error: 'You cannot ban yourself' },
        { status: 400 }
      );
    }

    // Update user status
    await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    // Send notification email for certain status changes
    if (status === 'WARNED' || status === 'SUSPENDED' || status === 'BANNED') {
      try {
        await sendUserEmail('status_change', user.email, {
          displayName: user.displayName,
          status: status,
        });
      } catch (emailError) {
        logError('Failed to send status change email:', emailError);
        // Don't fail the status change if email fails
      }

      // Send SMS if user opted in and it's an important status change
      if (user.smsOptIn && user.phoneNumber && (status === 'SUSPENDED' || status === 'BANNED')) {
        try {
          await sendUserSMS('status_change', user.phoneNumber, {
            displayName: user.displayName,
            status: status,
          });
        } catch (smsError) {
          logError('Failed to send status change SMS:', smsError);
          // Don't fail the status change if SMS fails
        }
      }
    }

    // TODO: Log moderation action
    // await prisma.moderationAction.create({
    //   data: {
    //     type: 'STATUS_CHANGE',
    //     targetUserId: userId,
    //     moderatorId: currentUser.id,
    //     details: { oldStatus: user.status, newStatus: status },
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: `User status changed to ${status}`,
      status,
    });
  } catch (error) {
    logError('Status change error:', error);
    return NextResponse.json(
      { error: 'Failed to change user status' },
      { status: 500 }
    );
  }
}
