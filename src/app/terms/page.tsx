import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#f8f6f1] py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <Link href="/" className="text-support hover:text-[#2a2a2a] mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-[#2a2a2a] mb-4">Terms of Service</h1>
          <p className="text-support text-sm">Last Updated: October 30, 2024</p>
        </div>

        <section className="mb-12">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e5e3dc]">
            <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-4">Welcome to Shared Thread</h2>
            <p className="text-[#2a2a2a] leading-relaxed mb-4">
              Shared Thread is a private, login-only community portal where creators draft structured works, 
              publish to a shared library, and engage in thoughtful discussion.
            </p>
            <p className="text-[#2a2a2a] leading-relaxed">
              By using Shared Thread, you agree to these terms. If you do not agree, please do not use our service.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Our Community Values</h2>
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc] space-y-4">
            <div className="border-l-4 border-[#2a2a2a] pl-4">
              <h4 className="font-semibold text-[#2a2a2a] mb-2">✨ Act with Honesty and Care</h4>
              <p className="text-support text-sm">Engage authentically and respect others perspectives</p>
            </div>
            <div className="border-l-4 border-[#2a2a2a] pl-4">
              <h4 className="font-semibold text-[#2a2a2a] mb-2">🤝 Prioritize Equity and Accessibility</h4>
              <p className="text-support text-sm">Welcome diverse voices and champion inclusive practices</p>
            </div>
            <div className="border-l-4 border-[#2a2a2a] pl-4">
              <h4 className="font-semibold text-[#2a2a2a] mb-2">🌱 Foster Collective Growth</h4>
              <p className="text-support text-sm">Share knowledge and give constructive feedback</p>
            </div>
            <div className="border-l-4 border-[#2a2a2a] pl-4">
              <h4 className="font-semibold text-[#2a2a2a] mb-2">🛡️ Refuse Exploitation</h4>
              <p className="text-support text-sm">No spam, harassment, plagiarism, or extractive behavior</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Content Guidelines</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
              <h3 className="text-xl font-semibold text-[#2a2a2a] mb-3">Prohibited Content</h3>
              <ul className="list-disc list-inside text-[#2a2a2a] space-y-2">
                <li>Harassment or hate speech targeting individuals or groups</li>
                <li>Plagiarism or passing off others work without attribution</li>
                <li>Spam, vote manipulation, or deceptive practices</li>
                <li>Illegal content</li>
                <li>Explicit sexual content or pornography</li>
                <li>Violence, threats, or misinformation</li>
                <li>Privacy violations</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
              <h3 className="text-xl font-semibold text-[#2a2a2a] mb-3">Your Content Rights</h3>
              <p className="text-[#2a2a2a]">
                <strong>You retain full ownership of your content.</strong> By posting, you grant us a limited 
                license to display and store your content.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Moderation</h2>
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-4">
              Violations may result in warnings, content removal, or account suspension. Appeal decisions via our{' '}
              <Link href="/contact" className="underline hover:text-support">contact form</Link>
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Disclaimers</h2>
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <p className="text-[#2a2a2a] mb-2 uppercase font-semibold">SERVICE PROVIDED AS IS WITHOUT WARRANTIES</p>
            <p className="text-[#2a2a2a]">We disclaim all warranties and are not liable for indirect damages.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#2a2a2a] mb-6">Contact</h2>
          <div className="bg-white p-6 rounded-lg border border-[#e5e3dc]">
            <div className="space-y-2 text-[#2a2a2a]">
              <div><strong>Questions or concerns?</strong> <Link href="/contact" className="underline hover:text-support">Use our contact form</Link></div>
              <div><strong>Entity:</strong> Shared Thread, LLC (Nebraska, USA)</div>
            </div>
          </div>
        </section>

        <div className="border-t border-[#e5e3dc] pt-8">
          <p className="text-center text-support text-sm mb-4">We weave not to bind, but to connect.</p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="text-support hover:text-[#2a2a2a] text-sm underline">Privacy Policy</Link>
            <Link href="/library" className="text-support hover:text-[#2a2a2a] text-sm underline">Return to Library</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
