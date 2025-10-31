import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f6f1] py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-support hover:text-[#2a2a2a] mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-[#2a2a2a] mb-4">Privacy Policy</h1>
          <p className="text-support text-sm">Last Updated: October 30, 2024</p>
        </div>

        {/* Introduction */}
        <section className="mb-12 prose prose-stone max-w-none">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e5e3dc]">
            <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-4">Our Privacy Philosophy</h2>
            <p className="text-[#2a2a2a] leading-relaxed mb-4">
              At Shared Thread, we believe <strong>privacy is a foundation, not an afterthought</strong>. 
              We build systems that care for the people inside them—and that starts with respecting your data, 
              your agency, and your right to control your information.
            </p>
            <p className="text-[#2a2a2a] leading-relaxed">
              This privacy policy reflects our commitment to transparency, minimal data collection, and 
              ethical technology practices. We only collect what we need to serve you, and we never sell 
              your data to third parties.
            </p>
          </div>
        </section>

        {/* What We Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">What Information We Collect</h2>
          
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
              <h3 className="text-xl font-semibold text-[#2a2a2a] mb-3">Account Information</h3>
              <ul className="list-disc list-inside text-[#2a2a2a] space-y-2">
                <li><strong>Email address</strong> - For authentication and essential account communications</li>
                <li><strong>Display name</strong> - Your chosen name for the community</li>
                <li><strong>Password</strong> - Securely hashed (we never store plaintext passwords)</li>
                <li><strong>Two-factor authentication codes</strong> - For enhanced account security (optional)</li>
              </ul>
            </div>

            {/* Content You Create */}
            <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
              <h3 className="text-xl font-semibold text-[#2a2a2a] mb-3">Content You Create</h3>
              <ul className="list-disc list-inside text-[#2a2a2a] space-y-2">
                <li><strong>Published works</strong> - Articles, projects, and creative content you share</li>
                <li><strong>Discussion posts and replies</strong> - Your contributions to community discourse</li>
                <li><strong>Ratings and reviews</strong> - Your evaluations of community works</li>
                <li><strong>Annotations</strong> - Beta feedback and paragraph-level comments</li>
              </ul>
            </div>

            {/* Technical Information */}
            <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
              <h3 className="text-xl font-semibold text-[#2a2a2a] mb-3">Technical Information</h3>
              <ul className="list-disc list-inside text-[#2a2a2a] space-y-2">
                <li><strong>Authentication session data</strong> - To keep you logged in securely</li>
                <li><strong>IP addresses</strong> - For security, abuse prevention, and staff VPN access control</li>
                <li><strong>Browser type and device information</strong> - To ensure compatibility and improve experience</li>
              </ul>
              <p className="text-support text-sm mt-4">
                <strong>What we DON&apos;T collect:</strong> We do not use tracking pixels, analytics cookies, 
                fingerprinting, or third-party advertising networks. We do not track your activity across other websites.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">How We Use Your Information</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <ul className="space-y-4 text-[#2a2a2a]">
              <li>
                <strong className="block mb-1">🔐 Provide and Secure Services</strong>
                <span className="text-support">
                  Authentication, content delivery, and protecting against abuse or security threats
                </span>
              </li>
              <li>
                <strong className="block mb-1">🤝 Enable Community Features</strong>
                <span className="text-support">
                  Display your works, discussions, and interactions within the Shared Thread community
                </span>
              </li>
              <li>
                <strong className="block mb-1">📧 Essential Communications</strong>
                <span className="text-support">
                  Account notifications, security alerts, and service updates (no marketing emails)
                </span>
              </li>
              <li>
                <strong className="block mb-1">🛡️ Safety and Moderation</strong>
                <span className="text-support">
                  Enforce community guidelines, investigate violations, and maintain a respectful environment
                </span>
              </li>
              <li>
                <strong className="block mb-1">⚖️ Legal Compliance</strong>
                <span className="text-support">
                  Comply with applicable laws and respond to valid legal requests
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Data Sharing and Disclosure</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              <strong>We do not sell your data. Period.</strong> We will never monetize your personal information 
              or share it with advertisers.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Public Content</h4>
                <p className="text-support">
                  Content you choose to publish (works, discussions, ratings) is visible to other Shared Thread 
                  users as part of the community experience.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Service Providers</h4>
                <p className="text-support">
                  We use trusted, privacy-respecting providers for essential infrastructure:
                </p>
                <ul className="list-disc list-inside text-support mt-2 space-y-1 ml-4">
                  <li><strong>Azure</strong> - Secure hosting and database services</li>
                  <li><strong>Cloudflare</strong> - Content delivery and DDoS protection</li>
                  <li><strong>Anthropic</strong> - AI-powered content suggestions (optional features only)</li>
                </ul>
                <p className="text-support mt-2 text-sm">
                  All providers are bound by strict data processing agreements and cannot use your data for their own purposes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Legal Requirements</h4>
                <p className="text-support">
                  We may disclose information if required by law, court order, or to protect the rights and 
                  safety of our users. We will notify you when legally permitted.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Your Privacy Rights</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              You have full control over your data. We honor requests from users worldwide, regardless of location.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-l-4 border-[#2a2a2a] pl-4">
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Access</h4>
                <p className="text-support text-sm">
                  Request a copy of all personal data we hold about you
                </p>
              </div>

              <div className="border-l-4 border-[#2a2a2a] pl-4">
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Correction</h4>
                <p className="text-support text-sm">
                  Update or correct your account information at any time
                </p>
              </div>

              <div className="border-l-4 border-[#2a2a2a] pl-4">
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Deletion</h4>
                <p className="text-support text-sm">
                  Delete your account and associated data (some content may be retained for integrity)
                </p>
              </div>

              <div className="border-l-4 border-[#2a2a2a] pl-4">
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Portability</h4>
                <p className="text-support text-sm">
                  Export your content in a machine-readable format
                </p>
              </div>

              <div className="border-l-4 border-[#2a2a2a] pl-4">
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Objection</h4>
                <p className="text-support text-sm">
                  Opt out of optional data processing or AI features
                </p>
              </div>

              <div className="border-l-4 border-[#2a2a2a] pl-4">
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Restriction</h4>
                <p className="text-support text-sm">
                  Limit how we process your data in certain circumstances
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#f8f6f1] rounded">
              <p className="text-[#2a2a2a] font-semibold mb-2">Exercise Your Rights</p>
              <p className="text-support text-sm mb-2">
                To make a data request, use our{' '}
                <Link href="/contact" className="underline hover:text-[#2a2a2a]">
                  contact form
                </Link>
              </p>
              <p className="text-support text-sm">
                We will respond to all requests within 30 days.
              </p>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Data Security</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              We implement industry-standard security measures to protect your information:
            </p>

            <ul className="space-y-3 text-[#2a2a2a]">
              <li className="flex items-start">
                <span className="mr-3">🔒</span>
                <div>
                  <strong>Encryption:</strong> All data transmitted over HTTPS/TLS. Passwords are hashed using bcrypt.
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-3">🛡️</span>
                <div>
                  <strong>VPN Protection:</strong> Staff and admin pages require Tailscale VPN access (network-level security).
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-3">🔐</span>
                <div>
                  <strong>Two-Factor Authentication:</strong> Optional TOTP 2FA for enhanced account security.
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-3">🚨</span>
                <div>
                  <strong>Access Logging:</strong> All administrative actions are logged for security audits.
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-3">🔍</span>
                <div>
                  <strong>Regular Audits:</strong> We conduct security reviews and maintain updated dependencies.
                </div>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded">
              <p className="text-sm text-amber-900">
                <strong>Security Incident Policy:</strong> In the unlikely event of a data breach, we will notify 
                affected users within 72 hours and provide transparent details about the incident and our response.
              </p>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Data Retention</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <ul className="space-y-3 text-[#2a2a2a]">
              <li>
                <strong>Active Accounts:</strong> We retain your data as long as your account is active.
              </li>
              <li>
                <strong>Deleted Accounts:</strong> Personal identifiers are removed within 30 days. Some content 
                (published works, public discussions) may be retained for community integrity, but will be anonymized.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may retain certain data longer if required by law or to 
                resolve disputes.
              </li>
              <li>
                <strong>Backups:</strong> Backup copies are deleted within 90 days of account deletion.
              </li>
            </ul>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Children&apos;s Privacy</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a]">
              Shared Thread is not directed to children under 13 (or 16 in the European Union). We do not 
              knowingly collect personal information from children. If you believe we have collected information 
              from a child, please contact us immediately via our{' '}
              <Link href="/contact" className="underline hover:text-[#2a2a2a]">
                contact form
              </Link>
              .
            </p>
          </div>
        </section>

        {/* International Users */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">International Users</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              Shared Thread is operated from the United States. If you are accessing our service from outside 
              the U.S., your information will be transferred to, stored, and processed in the United States.
            </p>
            <p className="text-[#2a2a2a]">
              <strong>GDPR Compliance:</strong> We honor all GDPR rights for European users, including data 
              portability, right to erasure, and objection to processing.
            </p>
          </div>
        </section>

        {/* AI and Automated Processing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">AI and Automated Processing</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              Shared Thread uses AI (Anthropic Claude) for <strong>optional</strong> features like content 
              suggestions and discussion search. These features:
            </p>
            <ul className="list-disc list-inside text-[#2a2a2a] space-y-2 mb-4">
              <li>Are <strong>opt-in only</strong> - AI features require explicit action to use</li>
              <li>Do not train models on your data - Anthropic&apos;s API does not use your content for training</li>
              <li>Are privacy-preserving - Only the content you explicitly submit is processed</li>
              <li>Can be avoided - All core features work without AI</li>
            </ul>
            <p className="text-support text-sm">
              We do not use AI for automated decision-making that significantly affects your account or access.
            </p>
          </div>
        </section>

        {/* Cookies and Tracking */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Cookies and Tracking</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              We use minimal cookies for essential functionality only:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="font-semibold text-[#2a2a2a] min-w-[140px]">Authentication:</span>
                <span className="text-support">Secure session cookies to keep you logged in</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-[#2a2a2a] min-w-[140px]">Security:</span>
                <span className="text-support">CSRF tokens to protect against cross-site attacks</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-900">
                <strong>What we DON&apos;T use:</strong> No advertising cookies, no third-party analytics 
                (Google Analytics, Facebook Pixel, etc.), no tracking pixels, no fingerprinting.
              </p>
            </div>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Changes to This Policy</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              We may update this privacy policy from time to time to reflect changes in our practices or legal 
              requirements. When we make significant changes:
            </p>
            <ul className="list-disc list-inside text-[#2a2a2a] space-y-2">
              <li>We will update the &quot;Last Updated&quot; date at the top of this page</li>
              <li>We will notify active users via email for material changes</li>
              <li>We will maintain previous versions in our{' '}
                <a 
                  href="https://github.com/mxchestnut/sharedthread" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-support"
                >
                  public GitHub repository
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Contact Us</h2>
          
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              If you have questions, concerns, or requests regarding this privacy policy or your data:
            </p>
            
            <div className="space-y-3 text-[#2a2a2a]">
              <div>
                <strong>Contact:</strong>{' '}
                <Link href="/contact" className="underline hover:text-support">
                  Submit a privacy request
                </Link>
              </div>
              <div>
                <strong>Website:</strong>{' '}
                <a href="https://sharedthread.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-support">
                  sharedthread.co
                </a>
              </div>
              <div>
                <strong>Legal Entity:</strong> Shared Thread, LLC (Nebraska, USA)
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#f8f6f1] rounded">
              <p className="text-support text-sm">
                We are committed to working with you to obtain a fair resolution of any privacy concern.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-[#e5e3dc] pt-8">
          <p className="text-center text-support text-sm">
            This policy reflects Shared Thread&apos;s commitment to building systems that care for the people inside them.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="text-support hover:text-[#2a2a2a] text-sm underline">
              Terms of Service
            </Link>
            <Link href="/library" className="text-support hover:text-[#2a2a2a] text-sm underline">
              Return to Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
