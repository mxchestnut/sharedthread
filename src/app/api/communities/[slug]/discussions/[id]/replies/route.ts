// API route to create discussion replies with plagiarism and AI detection
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkPlagiarism, checkAIContent } from '@/lib/content-check';
import { logError } from '@/lib/error-logger';
import { createNotification } from '@/lib/notifications';


export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug, id: postId } = params;
    const body = await request.json();
    const { content, parentId, citations } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get the community and check access
    const community = await prisma.community.findFirst({
      where: {
        slug: slug,
        isApproved: true
      },
      include: {
        members: {
          where: {
            userId: user.id
          }
        }
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user can reply (member or admin)
    const isMember = community.members.length > 0;
    const isAdmin = user.role === 'admin';
    
    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: 'Must be a community member to reply' }, { status: 403 });
    }

    // Verify the discussion post exists
    const post = await prisma.discussionPost.findUnique({
      where: { id: postId },
      include: { category: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Check for plagiarism and AI-generated content
    const plagiarismCheck = await checkPlagiarism(content);
    const aiCheck = await checkAIContent(content);

    // If plagiarized or AI-generated, require citations
    if (plagiarismCheck.isPlagiarized || (aiCheck.isAI && aiCheck.score > 0.7)) {
      if (!citations || citations.length === 0) {
        return NextResponse.json({
          error: 'This content appears to be plagiarized or AI-generated. Please cite your sources.',
          details: {
            plagiarism: plagiarismCheck,
            aiContent: aiCheck,
          },
          requiresCitations: true,
        }, { status: 400 });
      }
    }

    // Score answer quality (if this is a reply to a question)
    let qualityScore: number | null = null;
    if (post.category.slug === 'questions' || post.category.name.toLowerCase().includes('question')) {
      try {
        const scoreResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/score-answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionTitle: post.title,
            questionContent: post.content,
            answerContent: content,
          }),
        });
        if (scoreResponse.ok) {
          const scoreData = await scoreResponse.json();
          qualityScore = scoreData.overallScore || null;
        }
      } catch (error) {
        logError('Error scoring answer quality:', error);
        // Continue without quality score if scoring fails
      }
    }

    // Create the reply
    const reply = await prisma.discussionReply.create({
      data: {
        content,
        authorId: user.id,
        postId,
        parentId: parentId || undefined,
        citations: citations || undefined,
        qualityScore,
        hasPlagiarismFlag: plagiarismCheck.isPlagiarized,
        hasAIFlag: aiCheck.isAI && aiCheck.score > 0.7,
        aiScore: aiCheck.score || 0,
        plagiarismScore: plagiarismCheck.score || 0,
        moderationStatus: (plagiarismCheck.isPlagiarized || (aiCheck.isAI && aiCheck.score > 0.7)) ? 'FLAGGED' : 'CLEAN',
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update reply count on the post
    await prisma.discussionPost.update({
      where: { id: postId },
      data: {
        replyCount: {
          increment: 1,
        },
      },
    });

    // Notify the discussion author (if not replying to own post)
    if (post.authorId !== user.id) {
      await createNotification({
        userId: post.authorId,
        actorId: user.id,
        type: 'COMMENT',
        message: `${user.displayName || user.username} replied to your discussion in ${community.name}`,
        link: `/communities/${slug}/discussions/${postId}#reply-${reply.id}`,
        metadata: { communityId: community.id, postId, replyId: reply.id },
      });
    }

    // If replying to another user's reply, notify them too
    if (parentId) {
      const parentReply = await prisma.discussionReply.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      
      if (parentReply && parentReply.authorId !== user.id && parentReply.authorId !== post.authorId) {
        await createNotification({
          userId: parentReply.authorId,
          actorId: user.id,
          type: 'COMMENT',
          message: `${user.displayName || user.username} replied to your comment in ${community.name}`,
          link: `/communities/${slug}/discussions/${postId}#reply-${reply.id}`,
          metadata: { communityId: community.id, postId, replyId: reply.id, parentId },
        });
      }
    }

    return NextResponse.json({
      ...reply,
      qualityScore: qualityScore ? {
        score: qualityScore,
        message: qualityScore >= 70 ? 'High quality answer!' : qualityScore >= 50 ? 'Good answer' : 'Consider adding more detail',
      } : null,
    }, { status: 201 });

  } catch (error) {
    logError('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}
