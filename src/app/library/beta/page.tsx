import React from 'react';
import Link from 'next/link';
import LibraryCard from '@/components/LibraryCard';

export default function BetaWorksPage() {
  return (
    <section>
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-border p-1 inline-flex mb-6">
        <Link href="/library" className="px-4 py-2 text-support hover:text-secondary transition-colors">
          Library
        </Link>
        <Link href="/library/beta" className="px-4 py-2 bg-white rounded-md font-medium">
          Beta Works
        </Link>
        <Link href="/library/discourse" className="px-4 py-2 text-support hover:text-secondary transition-colors">
          Discourse
        </Link>
      </div>

      {/* Beta Works Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-blue-900 mb-2">Beta Works</h2>
        <p className="text-sm text-blue-800">
          Works in beta phase accept paragraph-level comments and suggestions from the community. 
          Authors use this feedback to refine their work before final publication.
        </p>
      </div>

      {/* Beta Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <LibraryCard
          title="The Future of Urban Magic (Beta)"
          excerpt="Seeking feedback on chapter 3: 'Zoning Laws and Enchantment Licenses' - particularly the section on community consent protocols."
          rating="Draft"
          comments={8}
          saves={5}
        />
        <LibraryCard
          title="Digital Folklore Archive (Beta)"
          excerpt="Need input on user interface design for the story collection system. How should we categorize traditional vs. modern adaptations?"
          rating="Draft"
          comments={12}
          saves={7}
        />
        <LibraryCard
          title="Mythical Creature Psychology (Beta)"
          excerpt="Chapter 2 draft ready for review. Looking for feedback on the cognitive behavioral analysis of dragon hoarding patterns."
          rating="Draft"
          comments={15}
          saves={9}
        />
      </div>

      {/* Empty State for when no beta works */}
      <div className="text-center py-12 text-ink/60">
        <p className="mb-4">No other beta works are currently accepting feedback.</p>
        <Link 
          href="/atelier" 
          className="text-accent hover:text-accent/80 underline"
        >
          Start your own work in the Atelier
        </Link>
      </div>
    </section>
  );
}