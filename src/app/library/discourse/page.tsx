import React from 'react';
import Link from 'next/link';

export default function DiscoursePage() {
  return (
    <section>
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-border p-1 inline-flex mb-6">
        <Link href="/library" className="px-4 py-2 text-support hover:text-secondary transition-colors">
          Library
        </Link>
        <Link href="/library/beta" className="px-4 py-2 text-support hover:text-secondary transition-colors">
          Beta Works
        </Link>
        <Link href="/library/discourse" className="px-4 py-2 bg-white rounded-md font-medium">
          Discourse
        </Link>
      </div>

      {/* Discourse Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-purple-900 mb-2">Community Discourse</h2>
        <p className="text-sm text-purple-800">
          Engage in discussions about works, topics, and ideas. Start conversations, ask questions, 
          and share insights with the Shared Thread community.
        </p>
      </div>

      {/* Discussion Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-semibold text-secondary mb-2">📚 Work Discussions</h3>
          <p className="text-sm text-support mb-3">
            Conversations about specific works in the library.
          </p>
          <div className="space-y-2">
            <div className="border-l-2 border-accent pl-3">
              <Link href="#" className="text-sm font-medium hover:text-accent">
                The Ethics of Magic in Urban Spaces
              </Link>
              <p className="text-xs text-support">12 replies • 2 hours ago</p>
            </div>
            <div className="border-l-2 border-accent pl-3">
              <Link href="#" className="text-sm font-medium hover:text-accent">
                Environmental Ethics in Fantasy
              </Link>
              <p className="text-xs text-support">8 replies • 5 hours ago</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-secondary mb-2">💭 General Topics</h3>
          <p className="text-sm text-support mb-3">
            Broader discussions about themes, techniques, and ideas.
          </p>
          <div className="space-y-2">
            <div className="border-l-2 border-accent pl-3">
              <Link href="#" className="text-sm font-medium hover:text-accent">
                Building believable magic systems
              </Link>
              <p className="text-xs text-support">24 replies • 1 day ago</p>
            </div>
            <div className="border-l-2 border-accent pl-3">
              <Link href="#" className="text-sm font-medium hover:text-accent">
                Research methods for fictional worlds
              </Link>
              <p className="text-xs text-support">15 replies • 2 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Discussions */}
      <div className="card mb-6">
        <h3 className="font-semibold text-secondary mb-4">Recent Discussions</h3>
        <div className="space-y-4">
          <div className="border-b border-border pb-4 last:border-b-0">
            <Link href="#" className="font-medium hover:text-accent">
              How do you handle contradictory source material when building fictional worlds?
            </Link>
            <p className="text-sm text-support mt-1">
              32 replies • Anthropology of Fiction • Started by @worldbuilder_alex
            </p>
          </div>
          <div className="border-b border-border pb-4 last:border-b-0">
            <Link href="#" className="font-medium hover:text-accent">
              The role of technology in modern folklore adaptation
            </Link>
            <p className="text-sm text-support mt-1">
              18 replies • Digital Shamanism • Started by @tech_myths
            </p>
          </div>
          <div className="border-b border-border pb-4 last:border-b-0">
            <Link href="#" className="font-medium hover:text-accent">
              Ethical considerations when depicting real cultures in fantasy
            </Link>
            <p className="text-sm text-support mt-1">
              45 replies • Cultural Sensitivity • Started by @respectful_writer
            </p>
          </div>
        </div>
      </div>

      {/* Start New Discussion */}
      <div className="text-center">
        <Link 
          href="/discourse/new" 
          className="px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors inline-block"
        >
          Start New Discussion
        </Link>
      </div>
    </section>
  );
}