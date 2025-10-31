import Link from 'next/link';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">
            Accessibility Statement
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            Our commitment to making Shared Thread accessible to everyone.
          </p>
        </header>

        {/* Commitment */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Our Commitment
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <p className="text-secondary mb-4">
              Shared Thread is committed to ensuring digital accessibility for people with disabilities. 
              We are continually improving the user experience for everyone, and applying the relevant 
              accessibility standards.
            </p>
            <p className="text-ink font-semibold">
              We aim to conform to WCAG 2.1 Level AA standards.
            </p>
          </div>
        </section>

        {/* Current Standards */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Accessibility Standards
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded border border-border">
              <h3 className="font-semibold text-ink mb-3">WCAG 2.1 AA</h3>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Keyboard navigation support
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Screen reader compatibility
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Sufficient color contrast
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Resizable text up to 200%
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded border border-border">
              <h3 className="font-semibold text-ink mb-3">User Preferences</h3>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Respects reduced motion preferences
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Supports high contrast mode
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Compatible with browser zoom
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Clear focus indicators
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Accessibility Features
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Typography</h3>
              <p className="text-secondary">
                We use IBM Plex Sans and IBM Plex Mono fonts, chosen for their high readability and accessibility. 
                Text sizes can be increased using browser zoom without loss of functionality.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Alternative Text</h3>
              <p className="text-secondary">
                All images include descriptive alternative text. Decorative images are marked appropriately 
                to avoid unnecessary screen reader announcements.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Navigation</h3>
              <p className="text-secondary">
                The site can be fully navigated using only a keyboard. Tab order is logical and skip links 
                are provided to jump to main content.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Color & Contrast</h3>
              <p className="text-secondary">
                All text meets WCAG AA contrast requirements. Information is never conveyed through color alone, 
                and the interface works with high contrast browser settings.
              </p>
            </div>
          </div>
        </section>

        {/* Testing & Audit */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Testing & Audits
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-ink mb-2">Last Accessibility Audit</h3>
                <p className="text-secondary mb-1">October 15, 2025</p>
                <p className="text-sm text-support">
                  Comprehensive WCAG 2.1 AA compliance review conducted using automated tools 
                  and manual testing with screen readers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-2">Testing Tools</h3>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• WAVE Web Accessibility Evaluator</li>
                  <li>• Lighthouse accessibility audit</li>
                  <li>• NVDA and VoiceOver screen readers</li>
                  <li>• Keyboard-only navigation testing</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Known Issues */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Known Issues & Improvements
          </h2>
          <div className="bg-white p-6 rounded border border-border">
            <p className="text-secondary mb-4">
              We are actively working to address the following accessibility improvements:
            </p>
            <ul className="space-y-2 text-secondary">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                <div>
                  <strong>In Progress:</strong> Enhanced focus management for dynamic content updates
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                <div>
                  <strong>Planned:</strong> Additional ARIA landmarks for better navigation structure
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Feedback */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Accessibility Feedback
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <p className="text-secondary mb-4">
              We welcome your feedback on the accessibility of Shared Thread. Please let us know if you 
              encounter accessibility barriers or have suggestions for improvement.
            </p>
            <div className="space-y-3">
              <div>
                <strong className="text-ink">Contact:</strong>
                <Link 
                  href="/contact" 
                  className="text-accent hover:underline ml-2"
                >
                  Submit accessibility feedback
                </Link>
              </div>
              <div>
                <strong className="text-ink">Response Time:</strong>
                <span className="text-secondary ml-2">
                  We aim to respond to accessibility feedback within 5 business days.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Standards Reference */}
        <section>
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Standards & Resources
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a 
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white rounded border border-border hover:bg-panel transition-colors"
            >
              <h3 className="font-semibold text-ink mb-2">WCAG 2.1 Guidelines</h3>
              <p className="text-sm text-secondary">
                Web Content Accessibility Guidelines we follow
              </p>
            </a>
            <a 
              href="https://webaim.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white rounded border border-border hover:bg-panel transition-colors"
            >
              <h3 className="font-semibold text-ink mb-2">WebAIM Resources</h3>
              <p className="text-sm text-secondary">
                Learn more about web accessibility
              </p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}