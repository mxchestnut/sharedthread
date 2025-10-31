'use client';

import { useEffect, useState } from 'react';
import { FilePen, LibraryBig, MessageSquare, Lock, Users, Target, Earth } from 'lucide-react';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        setIsLoggedIn(response.ok);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-ink mb-6">
            Shared Thread
          </h1>
          <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
            A private workspace for creators to draft structured works, publish to a curated library, 
            and foster thoughtful discussion through collaborative annotation and Q&A.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-16 px-4 bg-panel">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-ink text-center mb-12">
            A Different Kind of Creative Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <FilePen className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">Structured Creation</h3>
              <p className="text-secondary">
                The Atelier provides a structured workspace for drafting, 
                beta testing, and publishing your creative works with built-in collaboration tools.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <LibraryBig className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">Curated Library</h3>
              <p className="text-secondary">
                Published works live in a searchable library where community members 
                can discover, discuss, and provide thoughtful feedback.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">Thoughtful Discussion</h3>
              <p className="text-secondary">
                Engage through paragraph-level annotations, Q&A sessions, and rating systems 
                designed to foster meaningful dialogue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-ink mb-8">
            Built on Strong Foundations
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-ink">Privacy First</h3>
              </div>
              <p className="text-secondary">
                Private, invite-only workspace with strong authentication and data protection. 
                Your creative process stays secure.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-ink">Community Driven</h3>
              </div>
              <p className="text-secondary">
                Built for creators, by creators. Community guidelines and transparent 
                governance ensure a supportive environment.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-ink">Quality Focused</h3>
              </div>
              <p className="text-secondary">
                Structured workflows and thoughtful design encourage deep work 
                and meaningful collaboration over quick consumption.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Earth className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-ink">Open Source</h3>
              </div>
              <p className="text-secondary">
                Transparent development with open-source components and 
                community involvement in platform decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for logged-out users */}
      {!isLoading && !isLoggedIn && (
        <section className="py-16 px-4 bg-panel">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-ink mb-4">
                Ready to Join?
              </h2>
              <p className="text-secondary mb-6">
                Shared Thread is currently in private beta. Request an invitation to join our community of thoughtful creators.
              </p>
            </div>
            
            {/* Community Guidelines Summary */}
            <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-ink mb-4">Our Community Values</h3>
              <ul className="space-y-3 text-secondary text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Thoughtful Creation:</strong> Quality over quantity, with structured workflows that encourage deep work.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Respectful Discussion:</strong> Constructive feedback and meaningful dialogue through our annotation and Q&A systems.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Privacy First:</strong> Your drafts remain private until you choose to share. Strong authentication protects your work.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Transparent Governance:</strong> Community-driven decisions with open development and clear moderation policies.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}