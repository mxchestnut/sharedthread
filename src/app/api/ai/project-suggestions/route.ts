import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PROJECT_TEMPLATES } from '@/types/project-templates';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: string;
  prompts: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    estimatedTime: string;
    order: number;
  }>;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Support both old and new input shapes
    const query = body.query || '';
    // Fuzzy match against template names and descriptions
    const normalizedQuery = query.trim().toLowerCase();
    const localMatches = PROJECT_TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(normalizedQuery) ||
      t.description.toLowerCase().includes(normalizedQuery)
    );
    if (localMatches.length > 0) {
      // Return local matches as suggestions (no Claude call needed)
      return NextResponse.json({ suggestions: localMatches });
    }
    // If no local match, ask Claude to generate a new, research-backed, logically sound template
    const prompt = `You are an expert research assistant and project designer. The user has requested a project type that does not exist in our template library. Your task is to create a new project template that is:\n- Research-backed (draw on best practices, academic sources, and real-world examples)\n- Logically structured (clear sections, progression, and scope)\n- Useful for creators in a real-world context\n\nRespond ONLY in valid JSON matching this TypeScript interface:\n\ninterface ProjectTemplate {\n  id: string; // a URL-friendly slug\n  name: string; // human-readable name\n  description: string; // 1-2 sentence summary\n  category: string; // e.g. Business, Academic, Personal\n  estimatedDuration: string; // e.g. '2-4 hours', 'Ongoing'\n  prompts: Array<{\n    id: string;\n    title: string;\n    description: string;\n    icon: string; // Lucide icon name\n    category: string;\n    estimatedTime: string;\n    order: number;\n  }>;\n}\n\nThe user query is: "${query}"\n\nReturn only the JSON object for the new template. Do not include any extra text, explanation, or markdown formatting. Every field must be filled. Use only well-researched, logical, and practical content.`;
    const completion = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    });
    let suggestions: ProjectTemplate[] = [];
    const content = Array.isArray(completion.content)
      ? completion.content.map(block => {
          if (typeof block === 'string') return block;
          if (block.type === 'text') return block.text;
          return '';
        }).join(' ')
      : (completion.content as string);
    try {
      // Try parsing as a single ProjectTemplate object
      const template = JSON.parse((content || '').trim());
      if (template && template.id && template.name && Array.isArray(template.prompts)) {
        suggestions = [template];
      }
    } catch {
      // fallback: try to extract JSON from the response
      if (typeof content === 'string') {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const template = JSON.parse(match[0]);
            if (template && template.id && template.name && Array.isArray(template.prompts)) {
              suggestions = [template];
            }
          } catch {}
        }
      }
    }
    return NextResponse.json({ suggestions });
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
