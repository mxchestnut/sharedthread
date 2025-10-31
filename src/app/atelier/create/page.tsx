"use client";

import React, { useState, useMemo, Suspense } from "react";
import { PROJECT_TEMPLATES, type ProjectTemplate } from "@/types/project-templates";

export default function ProjectCreationPage() {
  const [step, setStep] = useState<'intent' | 'template-suggestions' | 'template-grid' | 'details' | 'confirm'>('intent');
  const [userIntent, setUserIntent] = useState('');
  const [templateSuggestions, setTemplateSuggestions] = useState<ProjectTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  // Section editor state: one value per section prompt
  const [sectionValues, setSectionValues] = useState<{ [sectionId: string]: string }>({});

  // Initialize section values when template changes and step is 'details'
  React.useEffect(() => {
    if (step === 'details' && selectedTemplate && selectedTemplate.prompts.length > 0 && Object.keys(sectionValues).length === 0) {
      const initial: { [sectionId: string]: string } = {};
      selectedTemplate.prompts.forEach((prompt) => {
        initial[prompt.id] = '';
      });
      setSectionValues(initial);
    }
  }, [step, selectedTemplate, sectionValues]);

  // Dynamically import Editor to avoid SSR issues
  const Editor = useMemo(() => React.lazy(() => import('@/components/Editor')), []);

  // Step 1: Ask user what they want to create
  if (step === 'intent') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-10 max-w-lg w-full shadow-md">
          <h1 className="text-2xl font-bold text-ink mb-4">What do you want to create?</h1>
          <p className="text-support mb-6">Describe your project in a sentence or two. We&apos;ll recommend the best templates to get you started.</p>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-accent focus:border-accent"
            rows={3}
            placeholder="e.g., &apos;A portfolio for my design work&apos; or &apos;A research project on climate change&apos;"
            value={userIntent}
            onChange={e => setUserIntent(e.target.value)}
          />
          <button
            className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!userIntent.trim()}
            onClick={async () => {
              // Call API to get template suggestions (no AI branding)
              const res = await fetch('/api/ai/project-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userIntent }),
              });
              const result = await res.json();
              if (result.suggestions && Array.isArray(result.suggestions) && result.suggestions.length > 0) {
                setTemplateSuggestions(result.suggestions);
                setStep('template-suggestions');
              } else {
                // No match: log for staff, show 'Help me' as top suggestion
                await fetch('/api/ai/log-missing-template', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query: userIntent }),
                });
                setTemplateSuggestions([]);
                setStep('template-suggestions');
              }
            }}
          >
            Find Templates
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Show template suggestions (with 'Help me' if no match)
  if (step === 'template-suggestions') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-10 max-w-2xl w-full shadow-md">
          <h1 className="text-2xl font-bold text-ink mb-4">Recommended Project Templates</h1>
          <p className="text-support mb-6">Based on your description, here are some templates you can use. Or choose <b>Help me</b> for more guidance.</p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div
              className="border-2 border-accent text-accent py-6 rounded-lg font-medium hover:bg-accent/10 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => setStep('template-grid')}
            >
              <span className="text-lg font-semibold">Help me</span>
              <span className="text-sm text-support mt-1">I don&apos;t see what I need</span>
            </div>
            {templateSuggestions.map((template) => (
              <div
                key={template.id}
                className="border-2 border-gray-200 py-6 rounded-lg font-medium hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(template);
                  setStep('details');
                }}
              >
                <span className="text-lg font-semibold">{template.name}</span>
                <span className="text-sm text-support mt-1">{template.description}</span>
              </div>
            ))}
          </div>
          <button
            className="text-sm text-gray-500 underline"
            onClick={() => setStep('intent')}
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Show full template grid with 'Help me' as top option
  if (step === 'template-grid') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-10 max-w-4xl w-full shadow-md">
          <h1 className="text-2xl font-bold text-ink mb-4">All Project Templates</h1>
          <p className="text-support mb-6">Browse all available templates, or click <b>Help me</b> to describe what you&apos;re looking for.</p>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div
              className="border-2 border-accent text-accent py-6 rounded-lg font-medium hover:bg-accent/10 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => {
                setStep('intent');
                setUserIntent('');
              }}
            >
              <span className="text-lg font-semibold">Help me</span>
              <span className="text-sm text-support mt-1">Describe your project</span>
            </div>
            {PROJECT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="border-2 border-gray-200 py-6 rounded-lg font-medium hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(template);
                  setStep('details');
                }}
              >
                <span className="text-lg font-semibold">{template.name}</span>
                <span className="text-sm text-support mt-1">{template.description}</span>
              </div>
            ))}
          </div>
          <button
            className="text-sm text-gray-500 underline"
            onClick={() => setStep('intent')}
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-10 max-w-2xl w-full shadow-md">
          <h1 className="text-2xl font-bold text-ink mb-4">{selectedTemplate?.name} Project</h1>
          <p className="text-support mb-6">Fill out each section below to start your project. You can edit or skip sections as needed.</p>
          <div className="space-y-8">
            {selectedTemplate?.prompts.map((prompt) => (
              <div key={prompt.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-2">
                  {/* Optionally render icon here if desired */}
                  <span className="font-semibold text-lg text-ink">{prompt.title}</span>
                  <span className="ml-2 text-xs text-support bg-gray-100 rounded px-2 py-0.5">{prompt.category}</span>
                  <span className="ml-auto text-xs text-gray-400">{prompt.estimatedTime}</span>
                </div>
                <p className="text-support mb-3">{prompt.description}</p>
                <Suspense fallback={<div>Loading editor…</div>}>
                  <Editor
                    value={sectionValues[prompt.id] || ''}
                    onChange={(val: string) => setSectionValues(prev => ({ ...prev, [prompt.id]: val }))}
                    placeholder={`Write your ${prompt.title.toLowerCase()} here...`}
                    minHeight={120}
                  />
                </Suspense>
              </div>
            ))}
          </div>
          <button
            className="mt-8 w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
            onClick={() => setStep('confirm')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}