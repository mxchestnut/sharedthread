/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">
            Transparency
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            How Shared Thread operates, makes decisions, and remains accountable to our community.
          </p>
        </header>

        {/* Mission Statement */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Our Mission
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <p className="text-lg text-ink font-medium mb-2">
              "We build systems that care for the people inside them."
            </p>
            <p className="text-secondary">
              Shared Thread exists to create technology platforms that prioritize human dignity, 
              creativity, and authentic connection over engagement metrics and data extraction.
            </p>
          </div>
        </section>

        {/* Governance */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            How We're Governed
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Advisory Circles</h3>
              <p className="text-secondary">
                Community members and domain experts who guide major platform decisions 
                through consensus-based discussion.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Open Decision Log</h3>
              <p className="text-secondary">
                All significant platform decisions are documented and made publicly available 
                in our Transparency Vault.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-border">
              <h3 className="font-semibold text-ink mb-2">Financial Transparency</h3>
              <p className="text-secondary">
                Operating costs, revenue sources, and financial decisions are published quarterly.
              </p>
            </div>
          </div>
        </section>

        {/* Financial Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Financial Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-panel rounded border border-border">
              <div className="text-2xl font-bold text-accent mb-2">85%</div>
              <div className="text-sm text-secondary">Platform Development</div>
            </div>
            <div className="text-center p-4 bg-panel rounded border border-border">
              <div className="text-2xl font-bold text-accent mb-2">10%</div>
              <div className="text-sm text-secondary">Community Support</div>
            </div>
            <div className="text-center p-4 bg-panel rounded border border-border">
              <div className="text-2xl font-bold text-accent mb-2">5%</div>
              <div className="text-sm text-secondary">Operational Reserves</div>
            </div>
          </div>
          <p className="text-sm text-support mt-4">
            Financial details and quarterly reports are available in our Transparency Vault.
          </p>
        </section>

        {/* Challenge Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            The Challenge Process
          </h2>
          <div className="bg-panel p-6 rounded-lg border border-border">
            <p className="text-secondary mb-4">
              Anyone can question our decisions, policies, or actions. We believe criticism 
              makes us better and more accountable.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <div>
                  <strong className="text-ink">Submit a Challenge:</strong>
                  <span className="text-secondary"> Use our Challenge Form or email accountability@sharedthread.co</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <div>
                  <strong className="text-ink">Public Review:</strong>
                  <span className="text-secondary"> Challenges are reviewed by Advisory Circles within 30 days</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <div>
                  <strong className="text-ink">Published Response:</strong>
                  <span className="text-secondary"> Our response and any changes are published in quarterly Weave Reports</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link 
                href="/challenge" 
                className="inline-flex items-center px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition-opacity"
              >
                Submit a Challenge
              </Link>
            </div>
          </div>
        </section>

        {/* Transparency Vault */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Transparency Vault
          </h2>
          <div className="bg-white p-6 rounded-lg border border-border">
            <p className="text-secondary mb-4">
              Our complete transparency documentation, including decision logs, financial reports, 
              and community feedback responses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/vault" 
                className="inline-flex items-center px-4 py-2 border border-border rounded hover:bg-panel transition-colors"
              >
                View Transparency Vault →
              </Link>
              <a 
                href="https://github.com/sharedthread/transparency"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-border rounded hover:bg-panel transition-colors"
              >
                GitHub Repository →
              </a>
            </div>
          </div>
        </section>

        {/* Recent Updates / Weave Reports */}
        <section id="weave-reports">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Recent Updates & Weave Reports
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-start p-4 bg-white rounded border border-border">
              <div>
                <h3 className="font-semibold text-ink">Q4 2025 Weave Report</h3>
                <p className="text-sm text-secondary">Community feedback summary and platform updates</p>
              </div>
              <span className="text-xs text-support">Oct 25, 2025</span>
            </div>
            <div className="flex justify-between items-start p-4 bg-white rounded border border-border">
              <div>
                <h3 className="font-semibold text-ink">Updated Community Guidelines</h3>
                <p className="text-sm text-secondary">Refined language based on community input</p>
              </div>
              <span className="text-xs text-support">Oct 15, 2025</span>
            </div>
            <div className="flex justify-between items-start p-4 bg-white rounded border border-border">
              <div>
                <h3 className="font-semibold text-ink">Financial Report Q3 2025</h3>
                <p className="text-sm text-secondary">Operating costs and revenue transparency</p>
              </div>
              <span className="text-xs text-support">Oct 1, 2025</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}