'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Clock, BookOpen, Target, Users, BarChart3, Lightbulb, MessageSquare } from 'lucide-react';

interface ArticleTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  prompts: string[];
}

const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: 'research-question',
    title: 'Research Question/Hypothesis',
    description: 'Define your research question, hypothesis, and justify its importance',
    category: 'Research',
    estimatedTime: '45-60 min',
    icon: Target,
    prompts: [
      'What is your primary research question?',
      'What are your secondary/related questions?',
      'What is your hypothesis (if applicable)?',
      'Why is this question important or worth investigating?'
    ]
  },
  {
    id: 'background-research',
    title: 'Background & Context',
    description: 'Establish knowledge foundation and identify research gaps',
    category: 'Research',
    estimatedTime: '60-90 min',
    icon: BookOpen,
    prompts: [
      'What existing knowledge/research led you to this question?',
      'What gap in knowledge does this address?',
      'What are the key terms and concepts to define?',
      'What is the theoretical framework you\'re using?'
    ]
  },
  {
    id: 'methodology-design',
    title: 'Research Design & Methodology',
    description: 'Plan your research approach and data collection methods',
    category: 'Research',
    estimatedTime: '60-90 min',
    icon: BarChart3,
    prompts: [
      'What type of research is this (qualitative, quantitative, mixed)?',
      'What is your overall approach (experimental, observational, etc.)?',
      'What methods will you use (surveys, interviews, experiments, etc.)?',
      'What is your sampling strategy and sample size?'
    ]
  },
  {
    id: 'literature-review',
    title: 'Literature Review',
    description: 'Analyze existing research and identify key sources',
    category: 'Research',
    estimatedTime: '90-120 min',
    icon: BookOpen,
    prompts: [
      'What are the foundational papers/books in this area?',
      'Who are the leading researchers/authors?',
      'What are the key findings from each source?',
      'What theories are relevant to your research?'
    ]
  },
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    description: 'Create a compelling overview of your project or business concept',
    category: 'Business',
    estimatedTime: '30-45 min',
    icon: FileText,
    prompts: [
      'What is your core concept or value proposition?',
      'Who is your target audience or market?',
      'What are the key success factors?',
      'What are the main objectives and expected outcomes?'
    ]
  },
  {
    id: 'market-analysis',
    title: 'Market Analysis',
    description: 'Research your market, competitors, and opportunities',
    category: 'Business',
    estimatedTime: '60-90 min',
    icon: BarChart3,
    prompts: [
      'What is the size and scope of your target market?',
      'Who are your main competitors and what are their strengths/weaknesses?',
      'What market trends are relevant to your business?',
      'What opportunities and threats exist in the market?'
    ]
  },
  {
    id: 'team-collaboration',
    title: 'Team & Collaboration Plan',
    description: 'Define roles, responsibilities, and collaboration protocols',
    category: 'Management',
    estimatedTime: '30-45 min',
    icon: Users,
    prompts: [
      'Who are your team members and what are their roles?',
      'What are each person\'s key responsibilities?',
      'How will you communicate and collaborate effectively?',
      'What are the decision-making processes?'
    ]
  },
  {
    id: 'project-timeline',
    title: 'Timeline & Milestones',
    description: 'Plan project phases, deadlines, and key milestones',
    category: 'Management',
    estimatedTime: '30-45 min',
    icon: Clock,
    prompts: [
      'What are the major phases of your project?',
      'What are the key milestones and deadlines?',
      'What dependencies exist between different tasks?',
      'How will you track progress and handle delays?'
    ]
  },
  {
    id: 'creative-brief',
    title: 'Creative Brief',
    description: 'Define creative vision, style, and artistic direction',
    category: 'Creative',
    estimatedTime: '45-60 min',
    icon: Lightbulb,
    prompts: [
      'What is the creative vision or concept?',
      'Who is your target audience?',
      'What style, tone, or aesthetic are you aiming for?',
      'What are the key messages you want to convey?'
    ]
  },
  {
    id: 'character-development',
    title: 'Character Development',
    description: 'Create detailed character profiles and backgrounds',
    category: 'Creative',
    estimatedTime: '45-60 min',
    icon: Users,
    prompts: [
      'What are the character\'s basic details (name, age, background)?',
      'What are their key personality traits and motivations?',
      'What is their backstory and how does it affect them?',
      'How do they relate to other characters in your story?'
    ]
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes & Action Items',
    description: 'Document meetings, decisions, and follow-up actions',
    category: 'Management',
    estimatedTime: '15-30 min',
    icon: MessageSquare,
    prompts: [
      'What were the key topics discussed?',
      'What decisions were made?',
      'What action items were assigned and to whom?',
      'What are the next steps and follow-up dates?'
    ]
  },
  {
    id: 'reflection-journal',
    title: 'Reflection & Learning Journal',
    description: 'Document insights, lessons learned, and personal growth',
    category: 'Personal',
    estimatedTime: '20-30 min',
    icon: BookOpen,
    prompts: [
      'What did you learn or discover today?',
      'What challenges did you face and how did you handle them?',
      'What insights or realizations did you have?',
      'What would you do differently next time?'
    ]
  }
];

export default function ArticleTemplatesPage() {
  const categories = [...new Set(ARTICLE_TEMPLATES.map(template => template.category))];

  return (
    <div className="min-h-screen bg-paper">
      <div className="w-full py-8 px-6 pr-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/atelier"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Article Templates</h1>
            <p className="text-support text-lg">Choose a template to get started with structured prompts for your article.</p>
          </div>
        </div>

        {/* Templates by Category */}
        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-medium text-ink mb-6">{category}</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {ARTICLE_TEMPLATES.filter(template => template.category === category).map((template) => {
                const IconComponent = template.icon;
                return (
                  <Link
                    key={template.id}
                    href={`/atelier/article/new?template=${template.id}`}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-accent hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <IconComponent size={20} className="text-accent" />
                        </div>
                        <div>
                          <h3 className="font-medium text-ink group-hover:text-accent transition-colors">{template.title}</h3>
                          <div className="text-xs text-support mt-1">{template.estimatedTime}</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-support mb-4 line-clamp-2">{template.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-ink mb-2">Guiding Questions:</h4>
                      <ul className="text-xs text-support space-y-1">
                        {template.prompts.slice(0, 3).map((prompt, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-accent mt-1">•</span>
                            <span className="line-clamp-1">{prompt}</span>
                          </li>
                        ))}
                        {template.prompts.length > 3 && (
                          <li className="text-accent text-xs">+{template.prompts.length - 3} more questions...</li>
                        )}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {template.prompts.length} prompts
                      </span>
                      <span className="text-accent text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Start Writing →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Article Option */}
        <div className="bg-gradient-to-r from-accent/5 to-accent/10 border-2 border-accent rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-ink mb-4">Need something different?</h2>
          <p className="text-support mb-6">Start with a blank article and create your own structure.</p>
          <Link 
            href="/atelier/article/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors font-medium"
          >
            <FileText size={16} />
            Start Blank Article
          </Link>
        </div>
      </div>
    </div>
  );
}