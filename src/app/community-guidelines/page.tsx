/* eslint-disable react/no-unescaped-entities */
export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">
            Community Guidelines
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            How we create a respectful, constructive environment for everyone in our community.
          </p>
        </header>

        {/* Core Principle */}
        <section className="mb-8">
          <div className="bg-panel p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold text-ink mb-4">
              Our Core Principle
            </h2>
            <p className="text-xl text-ink font-medium mb-2">
              "Critique work, not people."
            </p>
            <p className="text-secondary">
              This simple rule guides everything we do. Focus on ideas, processes, and outcomes. 
              Discuss what could be improved, not who is wrong. Attack problems, not people.
            </p>
          </div>
        </section>

        {/* Guidelines */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-6">
            Community Standards
          </h2>
          
          <div className="space-y-6">
            {/* Respectful Communication */}
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-4">
                💬 Respectful Communication
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">✅ Do This</h4>
                  <ul className="space-y-1 text-secondary">
                    <li>• Use "I" statements when sharing opinions</li>
                    <li>• Ask clarifying questions before assuming intent</li>
                    <li>• Acknowledge good points in others' work</li>
                    <li>• Offer specific, actionable feedback</li>
                    <li>• Admit when you don't know something</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">❌ Avoid This</h4>
                  <ul className="space-y-1 text-secondary">
                    <li>• Personal attacks or character judgments</li>
                    <li>• Dismissive language ("that's stupid," "obviously")</li>
                    <li>• Assumptions about others' motivations</li>
                    <li>• Public shaming or calling people out</li>
                    <li>• Sarcasm that could be misunderstood</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Constructive Feedback */}
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-4">
                📝 Constructive Feedback
              </h3>
              <div className="space-y-4">
                <div className="bg-panel p-4 rounded">
                  <h4 className="font-semibold text-ink mb-2">Good Example:</h4>
                  <p className="text-secondary italic">
                    "This approach could be strengthened by addressing the privacy concerns raised in section 3. 
                    Have you considered using end-to-end encryption for that data flow?"
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <h4 className="font-semibold text-red-700 mb-2">Poor Example:</h4>
                  <p className="text-red-600 italic">
                    "This is completely wrong. You obviously don't understand privacy. 
                    Anyone with half a brain would use encryption."
                  </p>
                </div>
              </div>
            </div>

            {/* Inclusive Environment */}
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-4">
                🌍 Inclusive Environment
              </h3>
              <p className="text-secondary mb-4">
                We welcome people of all backgrounds, experience levels, and perspectives. 
                Diversity makes our community stronger.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-ink mb-2">We Celebrate</h4>
                  <ul className="space-y-1 text-secondary">
                    <li>• Different cultural perspectives</li>
                    <li>• Varying levels of technical experience</li>
                    <li>• Multiple ways of solving problems</li>
                    <li>• Questions from newcomers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-ink mb-2">Zero Tolerance For</h4>
                  <ul className="space-y-1 text-secondary">
                    <li>• Discrimination or harassment</li>
                    <li>• Gatekeeping ("real developers don't...")</li>
                    <li>• Elitism or condescension</li>
                    <li>• Exclusionary language</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Content Standards */}
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-4">
                📋 Content Standards
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-ink mb-2">Keep It Relevant</h4>
                  <p className="text-secondary">
                    Share content that helps advance knowledge, solves problems, or sparks constructive discussion. 
                    Off-topic content belongs in designated spaces.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-ink mb-2">Cite Your Sources</h4>
                  <p className="text-secondary">
                    Give credit where it's due. Link to original sources, acknowledge collaborators, 
                    and be transparent about what work is yours vs. adapted from others.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-ink mb-2">No Spam or Self-Promotion</h4>
                  <p className="text-secondary">
                    Share your work when it adds value to the discussion. Repeated promotion, 
                    irrelevant links, or commercial spam will be removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conflict Resolution */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Conflict Resolution
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <p className="text-secondary mb-4">
              Disagreements are natural and often productive. Here's how to handle them constructively:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <div>
                  <strong className="text-ink">Start with curiosity:</strong>
                  <span className="text-secondary"> "Help me understand your perspective on this..."</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <div>
                  <strong className="text-ink">Find common ground:</strong>
                  <span className="text-secondary"> Identify shared goals before addressing differences</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <div>
                  <strong className="text-ink">Address the issue privately first:</strong>
                  <span className="text-secondary"> Direct messages often resolve misunderstandings quickly</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                <div>
                  <strong className="text-ink">Know when to step away:</strong>
                  <span className="text-secondary"> Some conversations need time to cool down</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enforcement */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            How These Guidelines Are Enforced
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Community Self-Moderation</h3>
              <p className="text-secondary">
                Our community largely moderates itself through positive example and gentle correction. 
                Most issues are resolved through respectful dialogue.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Progressive Response</h3>
              <p className="text-secondary">
                Violations typically result in: (1) Private conversation, (2) Public reminder of guidelines, 
                (3) Temporary restrictions, (4) Permanent removal only for severe or repeated violations.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Appeal Process</h3>
              <p className="text-secondary">
                Any moderation action can be appealed. Appeals are reviewed by the Advisory Circle 
                and decided by community consensus when possible.
              </p>
            </div>
          </div>
        </section>

        {/* Reporting */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Reporting Issues
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <p className="text-secondary mb-4">
              If you encounter behavior that violates these guidelines or makes you feel unsafe, please report it:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-ink mb-2">Quick Report</h3>
                <p className="text-secondary mb-2">For immediate issues:</p>
                <a 
                  href="mailto:community@sharedthread.co" 
                  className="inline-flex items-center px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition-opacity"
                >
                  Email Community Team
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-2">Detailed Report</h3>
                <p className="text-secondary mb-2">For complex situations:</p>
                <a 
                  href="/challenge" 
                  className="inline-flex items-center px-4 py-2 border border-border rounded hover:bg-white transition-colors"
                >
                  Use Challenge Form
                </a>
              </div>
            </div>
            <p className="text-sm text-support mt-4">
              All reports are reviewed confidentially. We take every concern seriously and respond within 24 hours.
            </p>
          </div>
        </section>

        {/* Evolution */}
        <section>
          <h2 className="text-2xl font-semibold text-ink mb-4">
            These Guidelines Evolve
          </h2>
          <div className="bg-white p-6 rounded-lg border border-border">
            <p className="text-secondary mb-4">
              Our community guidelines are living documents that improve based on real experience and community feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/transparency" 
                className="inline-flex items-center px-4 py-2 border border-border rounded hover:bg-panel transition-colors"
              >
                View Change History →
              </a>
              <a 
                href="https://github.com/sharedthread/transparency/blob/main/community-guidelines.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-border rounded hover:bg-panel transition-colors"
              >
                Suggest Changes on GitHub →
              </a>
            </div>
            <p className="text-sm text-support mt-4">
              <strong>Last Updated:</strong> October 15, 2025 | 
              <strong className="ml-4">Questions?</strong> Contact 
              <a href="mailto:community@sharedthread.co" className="text-accent hover:underline ml-1">
                community@sharedthread.co
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}