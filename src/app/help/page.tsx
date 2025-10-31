import React from 'react';
import { FAQSearch } from '@/components/help/FAQSearch';
import { HelpCircle } from 'lucide-react';

export default function HelpCenterPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold text-primary">Help Center</h1>
        </div>
        <p className="text-lg text-support max-w-2xl mx-auto">
          Find answers to common questions, learn how to use Shared Thread, or contact our support team
        </p>
      </div>

      {/* Search Component */}
      <FAQSearch />
    </div>
  );
}
