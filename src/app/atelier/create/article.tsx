// src/app/atelier/create/article.tsx
'use client';

import React, { useState } from 'react';
import { ArticleTemplate } from '@/types/article-templates';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

interface SectionState {
  heading: string;
  prompt: string;
  enabled: boolean;
  content: string;
}

export default function ArticleCreationPage({ initialTemplate }: { initialTemplate?: ArticleTemplate }) {
  const template = initialTemplate || null;
  const [sections, setSections] = useState<SectionState[]>(
    (initialTemplate?.sections || []).map(s => ({ ...s, enabled: true, content: '' }))
  );

  // If no template, prompt user to select one (not shown here)
  if (!template) {
    return <div className="p-8 text-center">Please select an article template to begin.</div>;
  }

  const handleToggle = (idx: number) => {
    setSections(sections =>
      sections.map((s, i) => (i === idx ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleContentChange = (idx: number, value: string) => {
    setSections(sections =>
      sections.map((s, i) => (i === idx ? { ...s, content: value } : s))
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{template.title}</h1>
      <p className="text-support mb-8">{template.description}</p>
      {sections.map((section, idx) => (
        <div key={idx} className="mb-10 border-b pb-8 last:border-b-0 last:pb-0">
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={() => handleToggle(idx)}
              className="accent-accent w-5 h-5"
            />
            <span className="font-semibold text-lg">{section.heading}</span>
          </div>
          <p className="text-support mb-3">{section.prompt}</p>
          {section.enabled && (
            <Editor
              value={section.content}
              onChange={val => handleContentChange(idx, val)}
              placeholder={section.prompt}
              minHeight={120}
            />
          )}
        </div>
      ))}
      {/* Submit button and logic here */}
    </div>
  );
}
