import Link from 'next/link';

export default function EthicalPolicyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">
            Ethical Policy & Data Use
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            How we handle your data, protect your privacy, and uphold ethical technology practices.
          </p>
        </header>

        {/* Core Principles */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Our Data Ethics Principles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-ink mb-3">🔒 Privacy by Design</h3>
              <p className="text-secondary">
                We collect only the minimum data necessary for platform functionality. 
                Your personal information is encrypted, never sold, and never shared without explicit consent.
              </p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-ink mb-3">🚫 No Dark Patterns</h3>
              <p className="text-secondary">
                We refuse to use manipulative design, hidden charges, confusing interfaces, 
                or any technique that tricks users into unwanted actions.
              </p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-ink mb-3">🎯 Consent-Based</h3>
              <p className="text-secondary">
                Every data collection and processing activity requires clear, informed consent. 
                You can withdraw consent at any time.
              </p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-ink mb-3">📊 Transparent Analytics</h3>
              <p className="text-secondary">
                We use privacy-first analytics tools that don&apos;t track individuals across sites 
                or build behavioral profiles.
              </p>
            </div>
          </div>
        </section>

        {/* What We Don't Do */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            What We DON&apos;T Do
          </h2>
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-ink mb-3">❌ NO Invasive Tracking</h3>
                <ul className="space-y-2 text-secondary">
                  <li>• No Google Analytics or Google Tag Manager</li>
                  <li>• No Facebook Pixel or social media trackers</li>
                  <li>• No cross-site behavioral tracking</li>
                  <li>• No fingerprinting or device identification</li>
                  <li>• No third-party advertising networks</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-3">❌ NO Data Exploitation</h3>
                <ul className="space-y-2 text-secondary">
                  <li>• We never sell your personal data</li>
                  <li>• No hidden data sharing agreements</li>
                  <li>• No behavioral profiling for ads</li>
                  <li>• No data mining for commercial purposes</li>
                  <li>• No undisclosed third-party integrations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics & Monitoring */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Privacy-First Analytics
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <p className="text-secondary mb-4">
              To improve our platform, we collect minimal, anonymized usage statistics that help us understand 
              how the site is used without tracking individual users.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border border-border">
                <h4 className="font-semibold text-ink mb-2">What We Measure</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Page views (anonymized)</li>
                  <li>• Site performance metrics</li>
                  <li>• Error rates</li>
                  <li>• Feature usage (aggregated)</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border border-border">
                <h4 className="font-semibold text-ink mb-2">How We Collect</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Self-hosted analytics only</li>
                  <li>• No external tracking scripts</li>
                  <li>• IP addresses are anonymized</li>
                  <li>• No personal identifiers stored</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border border-border">
                <h4 className="font-semibold text-ink mb-2">Your Control</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Opt-out available</li>
                  <li>• Respects Do Not Track</li>
                  <li>• No tracking cookies</li>
                  <li>• Data deleted after 30 days</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Data Protection & Security
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">🔐 Encryption Everywhere</h3>
              <p className="text-secondary">
                All data is encrypted in transit (HTTPS) and at rest. We use industry-standard 
                encryption protocols to protect your information.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">⏰ Data Retention</h3>
              <p className="text-secondary">
                We keep personal data only as long as necessary for platform functionality. 
                Inactive accounts are automatically purged after 2 years with prior notice.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">🗑️ Right to Deletion</h3>
              <p className="text-secondary">
                You can request complete deletion of your account and data at any time. 
                We provide data export tools before deletion.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">🛡️ Security Measures</h3>
              <p className="text-secondary">
                Regular security audits, penetration testing, and adherence to OWASP guidelines. 
                All staff receive privacy and security training.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Your Data Rights
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-ink mb-3">Rights You Have</h3>
                <ul className="space-y-2 text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2"></span>
                    <div>Right to know what data we collect</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2"></span>
                    <div>Right to access your personal data</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2"></span>
                    <div>Right to correct inaccurate data</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2"></span>
                    <div>Right to delete your data</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2"></span>
                    <div>Right to data portability</div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-3">How to Exercise Rights</h3>
                <p className="text-secondary mb-3">
                  Contact us to exercise any of these rights:
                </p>
                <div className="space-y-2">
                  <div>
                    <strong className="text-ink">Contact:</strong>
                    <Link 
                      href="/contact" 
                      className="text-accent hover:underline ml-2"
                    >
                      Submit privacy request
                    </Link>
                  </div>
                  <div className="text-sm text-support">
                    Response within 5 business days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookies & Storage */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Cookies & Local Storage
          </h2>
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-ink mb-2">Essential Cookies Only</h3>
                <p className="text-secondary">
                  We use only essential cookies required for platform functionality (authentication, security). 
                  No tracking or advertising cookies are used.
                </p>
              </div>
              <div className="bg-panel p-4 rounded">
                <h4 className="font-semibold text-ink mb-2">What We Store</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• <strong>Authentication token:</strong> To keep you logged in securely</li>
                  <li>• <strong>User preferences:</strong> Theme, language, accessibility settings</li>
                  <li>• <strong>Security headers:</strong> CSRF protection and session security</li>
                </ul>
              </div>
              <p className="text-sm text-support">
                No cookie banner is needed because we don&apos;t use tracking cookies. 
                Essential cookies are exempt from consent requirements under GDPR and CCPA.
              </p>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section>
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Legal Compliance
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">GDPR Compliant</h3>
              <p className="text-secondary">
                Full compliance with EU General Data Protection Regulation, including 
                data portability, right to deletion, and privacy by design.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">CCPA Compliant</h3>
              <p className="text-secondary">
                Meets California Consumer Privacy Act requirements for transparency, 
                data access, and consumer rights.
              </p>
            </div>
          </div>
          <div className="mt-6 bg-panel p-4 rounded border border-border">
            <p className="text-sm text-secondary">
              <strong>Last Updated:</strong> October 27, 2025 | 
              <strong className="ml-4">Questions?</strong>{' '}
              <Link href="/contact" className="text-accent hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}