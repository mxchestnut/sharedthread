import './globals.css';
import Link from 'next/link';
import { LibraryBig, Handshake, FilePen, ListChecks, Earth } from 'lucide-react';
import SessionProvider from '@/components/providers';
import ConditionalLayout from '@/components/ConditionalLayout';
import { Metadata } from 'next';
import GlobalHotkeys from '@/components/GlobalHotkeys';

export const metadata: Metadata = {
  title: 'Shared Thread',
  description: 'A creative workspace for thoughtful collaboration',
  openGraph: {
    title: 'Shared Thread',
    description: 'A private workspace for thoughtful collaboration',
    url: 'https://sharedthread.app',
    siteName: 'Shared Thread',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Shared Thread',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shared Thread',
    description: 'A private workspace for thoughtful collaboration',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Skip to main content link for keyboard navigation */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <SessionProvider>
          <GlobalHotkeys />
          <ConditionalLayout>{children}</ConditionalLayout>
          <footer className="mt-16 py-12 bg-black text-white border-t-4 border-black">
            <div className="w-full px-6">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Platform</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/library" className="hover:underline flex items-center gap-2"><LibraryBig size={16} /> Library</Link></li>
                    <li><Link href="/communities" className="hover:underline flex items-center gap-2"><Handshake size={16} /> Communities</Link></li>
                    <li><Link href="/atelier" className="hover:underline flex items-center gap-2"><FilePen size={16} /> Atelier</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">About</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/transparency" className="hover:underline flex items-center gap-2"><ListChecks size={16} /> Transparency</Link></li>
                    <li><Link href="/ethics" className="hover:underline flex items-center gap-2"><ListChecks size={16} /> Ethics</Link></li>
                    <li><Link href="/open-source" className="hover:underline flex items-center gap-2"><Earth size={16} /> Open Source</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Community</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/community-guidelines" className="hover:underline flex items-center gap-2"><Handshake size={16} /> Guidelines</Link></li>
                    <li><Link href="/accessibility" className="hover:underline">Accessibility</Link></li>
                    <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Resources</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="https://github.com/sharedthread" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2"><Earth size={16} /> GitHub</a></li>
                    <li><Link href="/transparency#weave-reports" className="hover:underline">Weave Reports</Link></li>
                    <li><Link href="/workshelf" className="hover:underline text-gray-400">Workshelf (Coming Soon)</Link></li>
                  </ul>
                </div>
              </div>
              <div className="text-center text-sm pt-8 border-t border-gray-700">
                <p className="font-semibold">Shared Thread</p>
                <p className="mt-2 text-gray-400">A private workspace for thoughtful collaboration</p>
                <p className="mt-1 text-gray-400 text-xs">Built with transparency, privacy, and community in mind</p>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}