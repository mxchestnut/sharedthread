'use client';

import { WorkEditor } from '@/components/atelier/work-editor';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NewWorkContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const promptId = searchParams.get('prompt');
  const templateId = searchParams.get('template');

  return (
    <WorkEditor 
      projectId={projectId}
      promptId={promptId}
      templateId={templateId}
    />
  );
}

export default function NewWorkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewWorkContent />
    </Suspense>
  );
}