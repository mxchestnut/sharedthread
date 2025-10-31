import { NextRequest, NextResponse } from 'next/server';
import { createCommunityProposalSchema } from '@/types/social';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkProposalSpam } from '@/lib/ai/spam-detector';
import { logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCommunityProposalSchema.parse(body);

    // Check if user already has pending proposals
    const existingPendingProposal = await prisma.communityProposal.findFirst({
      where: {
        proposerId: user.id,
        status: 'PENDING'
      }
    });
    
    if (existingPendingProposal) {
      return NextResponse.json(
        { error: 'You already have a pending proposal. Please wait for review.' },
        { status: 400 }
      );
    }

    // Check if proposed slug is already taken
    const existingSlug = await prisma.communityProposal.findFirst({
      where: {
        OR: [
          { proposedSlug: validatedData.proposedSlug },
          { approvedSlug: validatedData.proposedSlug }
        ]
      }
    });
    
    if (existingSlug) {
      return NextResponse.json(
        { error: 'This subdomain is already taken. Please choose a different one.' },
        { status: 400 }
      );
    }

    // Check if slug conflicts with existing communities
    const existingCommunity = await prisma.community.findFirst({
      where: {
        OR: [
          { slug: validatedData.proposedSlug },
          { subdomain: validatedData.proposedSlug }
        ]
      }
    });
    
    if (existingCommunity) {
      return NextResponse.json(
        { error: 'This subdomain is already in use. Please choose a different one.' },
        { status: 400 }
      );
    }

    // Check for spam
    const spamCheck = await checkProposalSpam(
      validatedData.proposedName,
      validatedData.description,
      validatedData.purpose,
      user.id
    );

    if (spamCheck.shouldBlock) {
      return NextResponse.json({
        error: 'This proposal has been flagged as potential spam.',
        reasons: spamCheck.reasons
      }, { status: 400 });
    }

    // Create the proposal in the database
    const proposal = await prisma.communityProposal.create({
      data: {
        proposedName: validatedData.proposedName,
        proposedSlug: validatedData.proposedSlug,
        description: validatedData.description,
        purpose: validatedData.purpose,
        expectedMembers: validatedData.expectedMembers,
        proposerId: user.id,
        status: 'PENDING'
      },
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            role: true
          }
        }
      }
    });

    // TODO: Send notification to staff about new proposal
    // await notifyStaffOfNewProposal(proposal);

    return NextResponse.json(
      { 
        success: true, 
        proposal,
        message: 'Community proposal submitted successfully. Staff will review within 3-5 business days.'
      },
      { status: 201 }
    );

  } catch (error) {
    logError('Error creating community proposal:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's proposals from database
    const proposals = await prisma.communityProposal.findMany({
      where: {
        proposerId: user.id
      },
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            role: true
          }
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ proposals });

  } catch (error) {
    logError('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}