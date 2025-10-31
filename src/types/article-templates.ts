// src/types/article-templates.ts
// Article template registry for Shared Thread
// Similar structure to PROJECT_TEMPLATES

export interface ArticleTemplate {
  id: string;
  title: string;
  description: string;
  sections: Array<{
    heading: string;
    prompt: string;
    minWords?: number;
    maxWords?: number;
  }>;
  tags?: string[];
  exampleTitles?: string[];
}

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: "opinion-essay",
    title: "Opinion Essay",
    description: "A structured essay expressing a clear opinion on a topic, supported by arguments and evidence.",
    sections: [
      { heading: "Introduction", prompt: "State your opinion and introduce the topic." },
      { heading: "Arguments", prompt: "Present 2-3 main arguments supporting your opinion, each with evidence or examples." },
      { heading: "Counterarguments", prompt: "Acknowledge and respond to at least one opposing viewpoint." },
      { heading: "Conclusion", prompt: "Summarize your position and its significance." }
    ],
    tags: ["essay", "opinion", "argument"],
    exampleTitles: ["Why Remote Work Is Here to Stay", "The Case for Universal Basic Income"]
  },
  // Add more templates as needed
];
