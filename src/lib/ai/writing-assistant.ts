/**
 * Writing Assistance Service
 * AI-powered feedback for Beta mode - comments only, NO automatic edits
 */

import Anthropic from '@anthropic-ai/sdk';
import { logError } from '@/lib/error-logger';


const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export interface WritingFeedback {
  overallAssessment: string;
  suggestions: WritingSuggestion[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface WritingSuggestion {
  type: 'clarity' | 'structure' | 'coherence' | 'style' | 'grammar';
  paragraph: number;
  issue: string;
  suggestion: string;
  severity: 'minor' | 'moderate' | 'major';
}

export interface ConsistencyIssue {
  type: 'terminology' | 'tone' | 'argument';
  locations: Array<{ paragraph: number; text: string }>;
  description: string;
  suggestion: string;
}

export interface ExpansionPrompt {
  paragraph: number;
  reason: string; // Why this section seems brief
  questions: string[]; // Questions to help expand
  angles: string[]; // Suggested expansion angles
}

export interface CitationSuggestion {
  paragraph: number;
  claim: string;
  suggestedSources: Array<{
    title: string;
    type: 'work' | 'external';
    relevance: string;
    workId?: string; // If it's a Shared Thread work
  }>;
}

/**
 * Analyze draft for clarity, structure, and coherence
 */
export async function analyzeWriting(
  content: string,
  title: string
): Promise<WritingFeedback> {
  if (!anthropic) {
    return {
      overallAssessment: 'AI writing feedback is not available. Please configure ANTHROPIC_API_KEY.',
      suggestions: [],
      strengths: [],
      areasForImprovement: []
    };
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Analyze this draft writing and provide constructive feedback. Focus on:
1. Clarity: Is the writing clear and easy to understand?
2. Structure: Is the content well-organized?
3. Coherence: Do ideas flow logically?

Title: ${title}

Content:
${content}

Provide feedback in JSON format:
{
  "overallAssessment": "Brief overall assessment",
  "suggestions": [
    {
      "type": "clarity|structure|coherence|style|grammar",
      "paragraph": <number>,
      "issue": "What's the problem",
      "suggestion": "How to improve",
      "severity": "minor|moderate|major"
    }
  ],
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"]
}

Keep suggestions constructive and specific. Never suggest wholesale rewrites.`
      }]
    });

    const content_block = response.content[0];
    if (content_block.type === 'text') {
      const jsonMatch = content_block.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const feedback = JSON.parse(jsonMatch[0]);
        return {
          overallAssessment: feedback.overallAssessment || 'No assessment available',
          suggestions: feedback.suggestions || [],
          strengths: feedback.strengths || [],
          areasForImprovement: feedback.areasForImprovement || []
        };
      }
    }
  } catch (error) {
    logError('Writing analysis error:', error);
  }

  return {
    overallAssessment: 'Unable to analyze writing at this time.',
    suggestions: [],
    strengths: [],
    areasForImprovement: []
  };
}

/**
 * Check for consistency issues across the document
 */
export async function checkConsistency(
  content: string,
  title: string
): Promise<ConsistencyIssue[]> {
  if (!anthropic) {
    return [];
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Analyze this writing for consistency issues:
- Terminology: Are key terms used consistently?
- Tone: Does the tone shift unexpectedly?
- Arguments: Are there logical contradictions?

Title: ${title}

Content:
${content}

Respond in JSON format:
{
  "issues": [
    {
      "type": "terminology|tone|argument",
      "locations": [{"paragraph": <number>, "text": "excerpt"}],
      "description": "What's inconsistent",
      "suggestion": "How to fix it"
    }
  ]
}`
      }]
    });

    const content_block = response.content[0];
    if (content_block.type === 'text') {
      const jsonMatch = content_block.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result.issues || [];
      }
    }
  } catch (error) {
    logError('Consistency check error:', error);
  }

  return [];
}

/**
 * Detect brief sections and suggest expansion
 */
export async function suggestExpansions(
  content: string,
  title: string
): Promise<ExpansionPrompt[]> {
  if (!anthropic) {
    return [];
  }

  // Split into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

  // Find brief paragraphs (under 100 words)
  const briefParagraphs = paragraphs
    .map((p, index) => ({
      index,
      text: p,
      wordCount: p.split(/\s+/).length
    }))
    .filter(p => p.wordCount < 100 && p.wordCount > 10);

  if (briefParagraphs.length === 0) {
    return [];
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `This writing has some brief sections that might benefit from expansion.
For each brief section, suggest:
1. Why it might need expansion
2. Questions to help the author think deeper
3. Angles they could explore

Title: ${title}

Brief sections:
${briefParagraphs.map(p => `Paragraph ${p.index + 1}: ${p.text.substring(0, 150)}...`).join('\n\n')}

Respond in JSON format:
{
  "expansions": [
    {
      "paragraph": <number>,
      "reason": "Why expand",
      "questions": ["question1", "question2"],
      "angles": ["angle1", "angle2"]
    }
  ]
}`
      }]
    });

    const content_block = response.content[0];
    if (content_block.type === 'text') {
      const jsonMatch = content_block.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result.expansions || [];
      }
    }
  } catch (error) {
    logError('Expansion suggestions error:', error);
  }

  return [];
}

/**
 * Suggest relevant citations
 */
export async function suggestCitations(
  content: string,
  existingWorks: Array<{ id: string; title: string; excerpt: string; tags: string[] }>
): Promise<CitationSuggestion[]> {
  if (!anthropic) {
    return [];
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Identify claims in this content that would benefit from citations.
For each claim, check if any of these existing works could serve as references.

Content:
${content}

Available works:
${existingWorks.map(w => `- ${w.title}: ${w.excerpt}`).join('\n')}

Respond in JSON format:
{
  "suggestions": [
    {
      "paragraph": <number>,
      "claim": "The claim that needs citation",
      "matchingWorkIds": ["id1", "id2"],
      "reasoning": "Why these works are relevant"
    }
  ]
}`
      }]
    });

    const content_block = response.content[0];
    if (content_block.type === 'text') {
      const jsonMatch = content_block.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const suggestions: CitationSuggestion[] = [];

        for (const sug of result.suggestions || []) {
          const matchedWorks = existingWorks.filter(w =>
            sug.matchingWorkIds?.includes(w.id)
          );

          suggestions.push({
            paragraph: sug.paragraph,
            claim: sug.claim,
            suggestedSources: matchedWorks.map(w => ({
              title: w.title,
              type: 'work' as const,
              relevance: sug.reasoning,
              workId: w.id
            }))
          });
        }

        return suggestions;
      }
    }
  } catch (error) {
    logError('Citation suggestions error:', error);
  }

  return [];
}
