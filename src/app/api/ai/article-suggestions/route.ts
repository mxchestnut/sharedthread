// src/app/api/ai/article-suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ARTICLE_TEMPLATES, ArticleTemplate } from "../../../../types/article-templates";
import { fuzzyMatchTemplates } from "../../../../lib/fuzzy-match";
import { anthropicClient } from "../../../../lib/anthropic";
import { z } from "zod";
import { logArticleTemplate } from "../../../../lib/staff-logs";

// Strict schema for Claude-generated article templates
const ArticleTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    prompt: z.string(),
    minWords: z.number().optional(),
    maxWords: z.number().optional(),
  })),
  tags: z.array(z.string()).optional(),
  exampleTitles: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing or invalid query" }, { status: 400 });
  }

  // Fuzzy match local templates
  const matches = fuzzyMatchTemplates(query, ARTICLE_TEMPLATES, 0.5); // threshold can be tuned
  if (matches.length > 0) {
    return NextResponse.json({
      source: "local",
      templates: matches,
    });
  }

  // If no match, prompt Claude to generate a research-backed article template
  const prompt = `You are a research assistant for a structured writing platform. A user wants to create an article of this type: "${query}". If you know of a well-established structure for this article type, generate a JSON object matching this TypeScript interface:

interface ArticleTemplate {
  id: string; // short, URL-safe unique id
  title: string; // human-readable name
  description: string; // what this article type is for
  sections: Array<{ heading: string; prompt: string; minWords?: number; maxWords?: number; }>;
  tags?: string[];
  exampleTitles?: string[];
}

Requirements:
- Only output valid JSON, no explanations.
- Structure must be logical, practical, and research-backed if possible.
- If unsure, make your best effort based on common writing standards.
- Do not invent types that do not exist.
- If there is no established structure, generate 6 research-backed prompts (sections) that would help a writer create a high-quality article of this type. Each prompt should be clear, actionable, and distinct.
`;

  const aiRes = await anthropicClient.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    temperature: 0.2,
    system: "You are a research assistant for a structured writing platform.",
    messages: [
      { role: "user", content: prompt },
    ],
  });

  let aiTemplate: ArticleTemplate | null = null;
  try {
    // Extract text from response
    let text = '';
    if (Array.isArray(aiRes.content)) {
      for (const block of aiRes.content) {
        if (typeof block === 'object' && block !== null && 'type' in block && block.type === 'text' && 'text' in block) {
          text = block.text as string;
          break;
        }
      }
    }
    if (!text) {
      throw new Error('No text block in Claude response');
    }
    const json = JSON.parse(text.trim());
    aiTemplate = ArticleTemplateSchema.parse(json);
    // Log for staff review
    logArticleTemplate(query, aiTemplate);
  } catch {
    return NextResponse.json({ error: "AI response could not be parsed" }, { status: 500 });
  }

  // TODO: Log this template for staff review (DB or file)

  return NextResponse.json({
    source: "ai",
    templates: [aiTemplate],
  });
}
