// API route to auto-extract topics from discussion content
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
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
    const { title, content } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Use Claude to extract topics
    const prompt = `Extract 3-5 relevant topics/tags from this discussion post. Return ONLY a JSON array of strings.

Title: ${title}
Content: ${content || '(no content)'}

Return format: ["topic1", "topic2", "topic3"]

Focus on:
- Main subjects being discussed
- Key concepts or themes
- Relevant categories
- Keep tags concise (1-3 words each)
- Use lowercase
- No duplicates`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const topics = JSON.parse(jsonMatch[0]);

    // Validate topics are strings
    if (!Array.isArray(topics) || !topics.every(t => typeof t === 'string')) {
      throw new Error('Invalid topics format');
    }

    return NextResponse.json({
      topics: topics.slice(0, 5), // Max 5 topics
    });

  } catch (error) {
    logError('Error extracting topics:', error);
    return NextResponse.json(
      { error: 'Failed to extract topics' },
      { status: 500 }
    );
  }
}
