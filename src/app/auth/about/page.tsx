import Link from 'next/link'

export default function AboutPrivacyPage() {
  return (
    <div className="min-h-screen bg-warm-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif text-charcoal mb-4">
            Privacy-First by Design
          </h1>
          <p className="text-xl text-warm-gray-800">
            How Shared Thread protects your privacy and data
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-warm-gray-200 p-8">
            <h2 className="text-xl font-medium text-charcoal mb-4">
              🍪 Zero Tracking Cookies
            </h2>
            <p className="text-warm-gray-700 mb-4">
              We only use essential cookies for authentication. No analytics, tracking, or advertising cookies ever.
            </p>
            <ul className="text-sm text-warm-gray-600 space-y-1">
              <li>• Authentication session cookies only</li>
              <li>• No Google Analytics or similar tracking</li>
              <li>• No third-party advertising cookies</li>
              <li>• No behavioral tracking or profiling</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-warm-gray-200 p-8">
            <h2 className="text-xl font-medium text-charcoal mb-4">
              🔒 Data Ownership
            </h2>
            <p className="text-warm-gray-700 mb-4">
              Your content belongs to you. Export it anytime, delete your account whenever you want.
            </p>
            <ul className="text-sm text-warm-gray-600 space-y-1">
              <li>• Full data export available</li>
              <li>• Account deletion removes all data</li>
              <li>• No data sharing with third parties</li>
              <li>• Content licensing stays with you</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-warm-gray-200 p-8">
            <h2 className="text-xl font-medium text-charcoal mb-4">
              🛡️ Security First
            </h2>
            <p className="text-warm-gray-700 mb-4">
              OAuth authentication with major providers, encrypted data, and secure infrastructure.
            </p>
            <ul className="text-sm text-warm-gray-600 space-y-1">
              <li>• OAuth with Google, GitHub, Microsoft, ORCID</li>
              <li>• Encrypted data transmission and storage</li>
              <li>• Regular security audits</li>
              <li>• Minimal data collection principle</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-warm-gray-200 p-8">
            <h2 className="text-xl font-medium text-charcoal mb-4">
              👥 Community Quality
            </h2>
            <p className="text-warm-gray-700 mb-4">
              Staff approval prevents spam and maintains a thoughtful creative community.
            </p>
            <ul className="text-sm text-warm-gray-600 space-y-1">
              <li>• Manual review of new registrations</li>
              <li>• 18+ age requirement for maturity</li>
              <li>• Clear community guidelines</li>
              <li>• Respectful feedback culture</li>
            </ul>
          </div>
        </div>

        <div className="bg-sage-light border border-sage-light rounded-lg p-8 mb-8">
          <h2 className="text-xl font-medium text-sage-dark mb-4">
            Why These Choices?
          </h2>
          <div className="space-y-4 text-sage-dark">
            <p>
              Shared Thread was created because we believe creators deserve a platform that respects 
              their privacy and intellectual property. Too many platforms prioritize engagement 
              metrics and advertising revenue over user well-being.
            </p>
            <p>
              Our ethical approach means you can focus on your creative work without worrying 
              about data harvesting, algorithmic manipulation, or losing control of your content.
            </p>
            <p>
              The manual approval process helps us maintain a community of serious creators who 
              are here to share meaningful work and provide constructive feedback.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-warm-gray-200 p-8">
          <h2 className="text-xl font-medium text-charcoal mb-6">
            Transparency Report
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-sage">0</div>
              <div className="text-sm text-warm-gray-600">Third-party trackers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sage">0</div>
              <div className="text-sm text-warm-gray-600">Data sales to advertisers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sage">100%</div>
              <div className="text-sm text-warm-gray-600">User data ownership</div>
            </div>
          </div>

          <div className="border-t border-warm-gray-200 pt-6">
            <h3 className="font-medium text-charcoal mb-2">What data do we collect?</h3>
            <ul className="text-sm text-warm-gray-600 space-y-1 mb-4">
              <li>• Email address (from OAuth provider)</li>
              <li>• Display name and profile picture (from OAuth provider)</li>
              <li>• Content you choose to publish</li>
              <li>• Basic usage logs for security and debugging</li>
            </ul>
            
            <h3 className="font-medium text-charcoal mb-2">What data do we NOT collect?</h3>
            <ul className="text-sm text-warm-gray-600 space-y-1">
              <li>• Browsing behavior outside Shared Thread</li>
              <li>• Device fingerprinting or tracking</li>
              <li>• Location data</li>
              <li>• Personal conversations or private drafts</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/auth/signin"
            className="bg-sage text-white px-6 py-3 rounded-md hover:bg-sage-dark transition-colors"
          >
            Join Our Privacy-First Community
          </Link>
          
          <div className="mt-6 space-x-6 text-sm">
            <Link 
              href="/legal/privacy" 
              className="text-sage hover:text-sage-dark underline"
            >
              Full Privacy Policy
            </Link>
            <Link 
              href="/legal/terms" 
              className="text-sage hover:text-sage-dark underline"
            >
              Terms of Service
            </Link>
            <Link 
              href="mailto:privacy@workShelf.com"
              className="text-sage hover:text-sage-dark underline"
            >
              Privacy Questions
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}