'use client';

import { useState } from 'react';

export default function ChallengePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    concern: '',
    relatedProject: '',
    supportingInfo: '',
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-green-800 mb-4">Thank You!</h1>
            <p className="text-green-700 mb-4">
              Your challenge has been submitted and will be reviewed by our Advisory Circle within 30 days.
            </p>
            <p className="text-green-600 text-sm">
              You&apos;ll receive a confirmation email shortly, and our response will be published in the next quarterly Weave Report.
            </p>
            <button 
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  concern: '',
                  relatedProject: '',
                  supportingInfo: '',
                  isAnonymous: false
                });
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Submit Another Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">
            Challenge & Contact
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            Hold us accountable. Question our decisions. Help us improve.
          </p>
        </header>

        {/* Why Challenge */}
        <section className="mb-8">
          <div className="bg-panel p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold text-ink mb-4">
              Why We Welcome Challenges
            </h2>
            <p className="text-secondary mb-4">
              We believe criticism makes us better. Every challenge forces us to examine our decisions, 
              explain our reasoning, and consider alternative approaches. Your skepticism helps us stay honest.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-semibold text-ink">Question Everything</div>
                <div className="text-sm text-secondary">No decision is above scrutiny</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-semibold text-ink">Public Response</div>
                <div className="text-sm text-secondary">All challenges get documented responses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold text-ink">Drive Change</div>
                <div className="text-sm text-secondary">Good challenges lead to policy updates</div>
              </div>
            </div>
          </div>
        </section>

        {/* Challenge Form */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-6">
            Submit a Challenge
          </h2>
          
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-border space-y-6">
            {/* Name/Anonymous Option */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="rounded border-border"
                />
                <label htmlFor="anonymous" className="text-ink font-medium">
                  Submit anonymously
                </label>
              </div>
              
              {!formData.isAnonymous && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary mb-2">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Concern */}
            <div>
              <label htmlFor="concern" className="block text-sm font-medium text-ink mb-2">
                What&apos;s your concern? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="concern"
                name="concern"
                value={formData.concern}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Describe the specific decision, policy, or action you want to challenge..."
              />
            </div>

            {/* Related Project */}
            <div>
              <label htmlFor="relatedProject" className="block text-sm font-medium text-secondary mb-2">
                Related Project or Decision
              </label>
              <input
                type="text"
                id="relatedProject"
                name="relatedProject"
                value={formData.relatedProject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., 'Community Guidelines Update Q3 2025' or 'Privacy Policy Changes'"
              />
            </div>

            {/* Supporting Info */}
            <div>
              <label htmlFor="supportingInfo" className="block text-sm font-medium text-secondary mb-2">
                Supporting Information
              </label>
              <textarea
                id="supportingInfo"
                name="supportingInfo"
                value={formData.supportingInfo}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Links, documents, or additional context that supports your challenge..."
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !formData.concern.trim()}
                className="px-6 py-2 bg-accent text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
              </button>
            </div>
          </form>
        </section>

        {/* Process */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            What Happens Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white p-4 rounded border border-border">
              <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold text-ink">Review (30 days)</h3>
                <p className="text-secondary">
                  Your challenge is reviewed by our Advisory Circle and relevant team members.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-4 rounded border border-border">
              <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold text-ink">Investigation</h3>
                <p className="text-secondary">
                  We gather additional information, consult relevant documentation, and assess the validity of concerns.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-4 rounded border border-border">
              <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold text-ink">Public Response</h3>
                <p className="text-secondary">
                  Our response and any resulting changes are published in the quarterly Weave Report.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Other Contact */}
        <section>
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Other Ways to Contact Us
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-ink mb-3">General Questions</h3>
              <p className="text-secondary">
                For non-critical questions about the platform, features, or policies, use the main contact form.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-ink mb-3">Private Concerns</h3>
              <p className="text-secondary">
                For sensitive issues that require confidential handling, submit through the challenge form above with the anonymous option.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-ink mb-3">Technical Issues</h3>
              <p className="text-secondary">
                For bugs, accessibility problems, or technical support, use the contact form and select &quot;Support&quot; as your contact type.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-ink mb-3">Community Guidelines</h3>
              <p className="text-secondary">
                For reporting community guideline violations or harassment, use the reporting tools within the platform or contact form.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}