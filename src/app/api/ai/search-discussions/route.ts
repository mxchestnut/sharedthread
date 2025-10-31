// API route to search for similar discussions before posting
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { logError } from '@/lib/error-logger';


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, communityId } = body;

    if (!title || !communityId) {
      return NextResponse.json(
        { error: 'Title and community ID are required' },
        { status: 400 }
      );
    }

    // Get existing discussions from the community
    const existingDiscussions = await prisma.discussionPost.findMany({
      where: {
        communityId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        replyCount: true,
        upvotes: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Check last 50 discussions
    });

    if (existingDiscussions.length === 0) {
      return NextResponse.json({
        similar: [],
        isDuplicate: false,
        message: 'No existing discussions found. You\'re the first!',
      });
    }

    // Use Claude to find similar discussions
    const prompt = `You are helping prevent duplicate discussions in an online community.

NEW DISCUSSION:
Title: ${title}
Content: ${content || '(no content provided)'}

EXISTING DISCUSSIONS:
${existingDiscussions.map((d, i) => `
${i + 1}. Title: ${d.title}
   Category: ${d.category.name}
   Preview: ${d.content.substring(0, 200)}...
   Replies: ${d.replyCount} | Upvotes: ${d.upvotes}
`).join('\n')}

Analyze if the new discussion is a duplicate or very similar to any existing ones.

Return a JSON object with:
{
  "isDuplicate": boolean, // true if essentially the same topic
  "similarDiscussions": [
    {
      "id": "discussion_id",
      "title": "title",
      "similarity": "high" | "medium" | "low",
      "reason": "brief explanation of similarity"
    }
  ],
  "recommendation": "What should the user do? (e.g., 'Post in existing thread' or 'Create new discussion')"
}

Only include discussions with medium or high similarity.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Enrich with full discussion data
    const enrichedSimilar = analysis.similarDiscussions.map((similar: { id: string; relevance: number }) => {
      const discussion = existingDiscussions.find(d => d.id === similar.id);
      return discussion ? {
        ...similar,
        replyCount: discussion.replyCount,
        upvotes: discussion.upvotes,
        category: discussion.category.name,
        createdAt: discussion.createdAt,
      } : similar;
    });

    return NextResponse.json({
      similar: enrichedSimilar,
      isDuplicate: analysis.isDuplicate,
      recommendation: analysis.recommendation,
    });

  } catch (error) {
    logError('Error searching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to search discussions' },
      { status: 500 }
    );
  }
}
