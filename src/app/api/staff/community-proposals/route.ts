import { NextRequest, NextResponse } from 'next/server';
import { reviewProposalSchema, ProposalStatus } from '@/types/social';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logError } from '@/lib/error-logger';


// Real database implementation - no more mock data needed!

async function checkStaffPermissions(user: { role?: string } | null): Promise<boolean> {
  // Check if user has admin role (case-insensitive)
  return user?.role?.toUpperCase() === 'ADMIN';
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and staff permissions
    const user = await getCurrentUser();
    if (!user || !await checkStaffPermissions(user)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Get proposals from database with filters
    const whereClause = status && status !== 'all' 
      ? { status: status as ProposalStatus }
      : {};
    
    const proposals = await prisma.communityProposal.findMany({
      where: whereClause,
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            role: true,
            reputationScore: true
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
      orderBy: [
        { status: 'asc' }, // Pending first
        { createdAt: 'asc' }
      ]
    });

    // Map database fields to match frontend types
    const mappedProposals = proposals.map((proposal: typeof proposals[0]) => ({
      id: proposal.id,
      proposedName: proposal.proposedName,
      proposedSlug: proposal.proposedSlug,
      description: proposal.description,
      purpose: proposal.purpose,
      expectedMembers: proposal.expectedMembers,
      submittedAt: proposal.createdAt,
      reviewedAt: proposal.reviewedAt,
      status: proposal.status,
      rejectionReason: proposal.rejectionReason,
      approvedSlug: proposal.approvedSlug,
      submitterId: proposal.proposerId,
      submitter: {
        id: proposal.proposer.id,
        username: proposal.proposer.username,
        displayName: proposal.proposer.displayName,
        email: proposal.proposer.email,
        reputation: proposal.proposer.reputationScore
      },
      reviewerId: proposal.reviewerId,
      reviewer: proposal.reviewer ? {
        id: proposal.reviewer.id,
        username: proposal.reviewer.username,
        displayName: proposal.reviewer.displayName
      } : undefined
    }));

    return NextResponse.json({ proposals: mappedProposals });

  } catch (error) {
    logError('Error fetching staff proposals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and staff permissions
    const user = await getCurrentUser();
    if (!user || !await checkStaffPermissions(user)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { proposalId, ...reviewData } = body;

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Validate review data
    const validatedReview = reviewProposalSchema.parse(reviewData);

    // Additional validation
    if (validatedReview.status === ProposalStatus.APPROVED && !validatedReview.approvedSlug) {
      return NextResponse.json(
        { error: 'Approved slug is required when approving a proposal' },
        { status: 400 }
      );
    }

    if (validatedReview.status === ProposalStatus.REJECTED && !validatedReview.rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a proposal' },
        { status: 400 }
      );
    }

    // Update proposal in database
    const updatedProposal = await prisma.communityProposal.update({
      where: { id: proposalId },
      data: {
        status: validatedReview.status,
        rejectionReason: validatedReview.rejectionReason,
        approvedSlug: validatedReview.approvedSlug,
        reviewedAt: new Date(),
        reviewedBy: user.id
      },
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            reputationScore: true
          }
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      }
    });

    // If approved, create the actual community
    if (validatedReview.status === ProposalStatus.APPROVED) {
      await prisma.community.create({
        data: {
          name: updatedProposal.proposedName,
          slug: validatedReview.approvedSlug!,
          subdomain: validatedReview.approvedSlug!,
          description: updatedProposal.description,
          isApproved: true,
          isPrivate: true, // Default to private
          ownerId: updatedProposal.proposerId,
          settings: {}
        }
      });
    }

    // TODO: Send rejection notification if rejected
    // if (validatedReview.status === ProposalStatus.REJECTED) {
    //   await sendRejectionNotification(
    //     updatedProposal.proposer, 
    //     validatedReview.rejectionReason!
    //   );
    // }

    // Map the response to match frontend types
    const mappedProposal = {
      id: updatedProposal.id,
      proposedName: updatedProposal.proposedName,
      proposedSlug: updatedProposal.proposedSlug,
      description: updatedProposal.description,
      purpose: updatedProposal.purpose,
      expectedMembers: updatedProposal.expectedMembers,
      submittedAt: updatedProposal.createdAt,
      reviewedAt: updatedProposal.reviewedAt,
      status: updatedProposal.status,
      rejectionReason: updatedProposal.rejectionReason,
      approvedSlug: updatedProposal.approvedSlug,
      submitterId: updatedProposal.proposerId,
      submitter: {
        id: updatedProposal.proposer.id,
        username: updatedProposal.proposer.username,
        displayName: updatedProposal.proposer.displayName,
        email: updatedProposal.proposer.email,
        reputation: updatedProposal.proposer.reputationScore
      },
      reviewerId: updatedProposal.reviewerId,
      reviewer: updatedProposal.reviewer ? {
        id: updatedProposal.reviewer.id,
        username: updatedProposal.reviewer.username,
        displayName: updatedProposal.reviewer.displayName
      } : undefined
    };

    return NextResponse.json({
      success: true,
      proposal: mappedProposal,
      message: validatedReview.status === ProposalStatus.APPROVED 
        ? 'Proposal approved. Community is being set up...'
        : 'Proposal reviewed successfully.'
    });

  } catch (error) {
    logError('Error reviewing proposal:', error);

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