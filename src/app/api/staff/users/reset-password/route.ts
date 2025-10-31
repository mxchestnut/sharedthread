import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendUserEmail } from '@/lib/email-service';
import crypto from 'crypto';
import { logInfo, logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    // Verify user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Note: In production, you'd store the reset token in the database
    // For now, we'll just update the timestamp
    await prisma.users.update({
      where: { id: userId },
      data: {
        updatedAt: new Date(),
      },
    });

    // Send password reset email
    try {
      await sendUserEmail('password_reset', user.email, {
        displayName: user.displayName,
        resetToken: resetToken,
      });
      
      logInfo(`Password reset email sent to ${user.email}`);
      
      return NextResponse.json({
        success: true,
        message: `Password reset email sent to ${user.email}`,
      });
    } catch (emailError) {
      logError('Failed to send password reset email:', emailError);
      
      // Return success anyway, but log the failure
      return NextResponse.json({
        success: true,
        message: `Password reset initiated for ${user.email}`,
        warning: 'Email delivery may have failed',
      });
    }
  } catch (error) {
    logError('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
