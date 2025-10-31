// API route to score answer quality for community voting
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
    const { questionTitle, questionContent, answerContent } = body;

    if (!questionTitle || !answerContent) {
      return NextResponse.json(
        { error: 'Question title and answer content are required' },
        { status: 400 }
      );
    }

    // Use Claude to score answer quality
    const prompt = `You are evaluating the quality of an answer in a scholarly community discussion.

QUESTION:
Title: ${questionTitle}
Content: ${questionContent || '(no additional context)'}

ANSWER:
${answerContent}

Evaluate this answer on the following criteria and return ONLY a JSON object:

{
  "overallScore": 0-100, // Overall quality score
  "criteria": {
    "relevance": 0-10, // How well it addresses the question
    "accuracy": 0-10, // Factual correctness and reliability
    "clarity": 0-10, // How clear and understandable it is
    "depth": 0-10, // Level of detail and insight
    "sources": 0-10 // Quality of citations/evidence provided
  },
  "strengths": ["strength1", "strength2"], // What makes this answer good
  "weaknesses": ["weakness1", "weakness2"], // What could be improved
  "recommendation": "excellent" | "good" | "fair" | "poor",
  "suggestAsAccepted": boolean // Should this be marked as the accepted answer?
}

Be objective and constructive.`;

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

    const qualityScore = JSON.parse(jsonMatch[0]);

    return NextResponse.json(qualityScore);

  } catch (error) {
    logError('Error scoring answer quality:', error);
    return NextResponse.json(
      { error: 'Failed to score answer quality' },
      { status: 500 }
    );
  }
}
