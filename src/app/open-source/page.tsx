export default function OpenSourceCreditsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">
            Open Source Credits
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            Shared Thread is built with love on the shoulders of open source giants. 
            Here&#39;s recognition for the tools, libraries, and communities that make our work possible.
          </p>
        </header>

        {/* Core Technologies */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-6">
            Core Technologies
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-3">
                <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Next.js
                </a>
              </h3>
              <p className="text-secondary mb-3">
                The React framework that powers our full-stack application. Built by Vercel with incredible performance and developer experience.
              </p>
              <div className="text-sm text-muted">
                License: MIT | Used for: Application framework, routing, API routes
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-3">
                <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  React
                </a>
              </h3>
              <p className="text-secondary mb-3">
                The foundational library for building our user interface. Created by Meta, maintained by an incredible community.
              </p>
              <div className="text-sm text-muted">
                License: MIT | Used for: UI components, state management, rendering
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-3">
                <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  TypeScript
                </a>
              </h3>
              <p className="text-secondary mb-3">
                Adds type safety to JavaScript, making our code more reliable and maintainable. Developed by Microsoft.
              </p>
              <div className="text-sm text-muted">
                License: Apache 2.0 | Used for: Type checking, developer experience
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-3">
                <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Tailwind CSS
                </a>
              </h3>
              <p className="text-secondary mb-3">
                Utility-first CSS framework that helps us create consistent, responsive designs quickly.
              </p>
              <div className="text-sm text-muted">
                License: MIT | Used for: Styling, responsive design, design system
              </div>
            </div>
          </div>
        </section>

        {/* Development Tools */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-6">
            Development Tools
          </h2>
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-ink mb-2">
                  <a href="https://eslint.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    ESLint
                  </a>
                </h3>
                <p className="text-sm text-secondary">Code quality and consistency</p>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-2">
                  <a href="https://prettier.io" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    Prettier
                  </a>
                </h3>
                <p className="text-sm text-secondary">Code formatting</p>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-2">
                  <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    Node.js
                  </a>
                </h3>
                <p className="text-sm text-secondary">JavaScript runtime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Fonts & Design */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-6">
            Typography & Design
          </h2>
          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold text-ink mb-3">
              <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Inter Font Family
              </a>
            </h3>
            <p className="text-secondary mb-3">
              A beautiful, highly readable typeface designed for user interfaces by Rasmus Andersson.
            </p>
            <div className="text-sm text-muted mb-4">
              License: SIL Open Font License 1.1 | Used for: All text throughout the application
            </div>
            <div className="text-sm text-secondary">
              Special thanks to Rasmus Andersson for creating and open-sourcing this exceptional font family.
            </div>
          </div>
        </section>

        {/* Our Contribution */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-6">
            Our Contribution Back
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold text-ink mb-4">
              <a href="https://github.com/sharedthread" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Shared Thread on GitHub
              </a>
            </h3>
            <p className="text-secondary mb-4">
              We believe in giving back to the open source community that makes our work possible.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-ink">Shared Thread Platform</h4>
                <p className="text-sm text-secondary">
                  Our entire platform will be open-sourced under MIT license once we reach stable beta.
                  Community contributions welcome!
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-ink">Component Library</h4>
                <p className="text-sm text-secondary">
                  Reusable UI components designed for critique-focused platforms.
                  Available under MIT license.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-ink">Annotation System</h4>
                <p className="text-sm text-secondary">
                  Our paragraph-level annotation and feedback system for beta readers.
                  Will be released as a standalone library.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Licensing */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-6">
            Our Licensing
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-3">
                <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  MIT License
                </a>
              </h3>
              <p className="text-secondary mb-3">
                Our code will be released under the MIT License, allowing maximum freedom for use, modification, and distribution.
              </p>
              <div className="text-sm text-muted">
                Applies to: Platform code, API, component library
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-ink mb-3">
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  CC BY-SA 4.0
                </a>
              </h3>
              <p className="text-secondary mb-3">
                Our documentation, design system, and educational content are shared under Creative Commons.
              </p>
              <div className="text-sm text-muted">
                Applies to: Documentation, design guides, educational materials
              </div>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-6">
            Community & Contributors
          </h2>
          <div className="bg-white p-6 rounded-lg border border-border">
            <p className="text-secondary mb-6">
              While Shared Thread is still in early development, we&#39;re grateful for the guidance, 
              feedback, and inspiration from various communities:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-ink mb-3">Advisory & Feedback</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  <li>• Writing and publishing communities</li>
                  <li>• Open source maintainers and contributors</li>
                  <li>• Accessibility advocates and testers</li>
                  <li>• Privacy and ethics researchers</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-3">Future Contributors</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  <li>• Frontend and backend developers</li>
                  <li>• UX/UI designers</li>
                  <li>• Documentation writers</li>
                  <li>• Community moderators</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-panel rounded border">
              <p className="text-sm text-ink">
                <strong>Want to contribute?</strong> Check out our{' '}
                <a href="https://github.com/sharedthread/platform/blob/main/CONTRIBUTING.md" className="text-accent hover:underline">
                  contribution guidelines
                </a>{' '}
                or reach out at{' '}
                <a href="mailto:contributors@sharedthread.co" className="text-accent hover:underline">
                  contributors@sharedthread.co
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Thank You */}
        <section>
          <div className="bg-accent/5 p-8 rounded-lg border border-accent/20 text-center">
            <h2 className="text-2xl font-semibold text-ink mb-4">
              Thank You
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              To every open source maintainer, contributor, and community member who has made 
              tools like these freely available – thank you. Your work enables countless others 
              to build, learn, and create. We&#39;re honored to be part of this ecosystem.
            </p>
            <div className="mt-6">
              <a 
                href="/transparency" 
                className="inline-block px-6 py-2 bg-accent text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Read Our Transparency Report
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}