'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TailscaleStatus {
  tailscale: {
    enabled: boolean;
    subnet: string;
    requireTailscale: boolean;
    environment: string;
  };
  client: {
    ip: string;
    isTailscale: boolean;
    headers: {
      'x-forwarded-for': string | null;
      'x-real-ip': string | null;
      'cf-connecting-ip': string | null;
    };
  };
  access: {
    staffPagesAllowed: boolean;
    message: string;
  };
}

export default function TailscaleStatusPage() {
  const [status, setStatus] = useState<TailscaleStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tailscale/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const isConnected = status?.client.isTailscale || false;

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tailscale VPN Status
          </h1>
          <p className="text-gray-600">
            Staff pages require connection to Shared Thread VPN
          </p>
        </div>

        {/* Connection Status */}
        <div className={`bg-white rounded-lg shadow-sm border-2 p-6 mb-6 ${
          isConnected ? 'border-green-500' : 'border-orange-500'
        }`}>
          <div className="flex items-start gap-4">
            {isConnected ? (
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            ) : (
              <XCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-2 ${
                isConnected ? 'text-green-700' : 'text-orange-700'
              }`}>
                {isConnected ? 'Connected to Tailscale' : 'Not Connected'}
              </h2>
              <p className="text-gray-700">
                {status?.access.message}
              </p>
            </div>
          </div>
        </div>

        {/* Connection Details */}
        {status && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Connection Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Your IP Address:</span>
                <span className="font-mono text-gray-900">{status.client.ip}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Tailscale Network:</span>
                <span className={`font-medium ${
                  isConnected ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Environment:</span>
                <span className="font-mono text-gray-900">
                  {status.tailscale.environment}
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Staff Access:</span>
                <span className={`font-medium ${
                  status.access.staffPagesAllowed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {status.access.staffPagesAllowed ? 'Allowed' : 'Denied'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">
                  How to Connect to Tailscale
                </h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Download Tailscale from <a href="https://tailscale.com/download" target="_blank" rel="noopener noreferrer" className="underline">tailscale.com/download</a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Install and sign in with your Shared Thread account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Contact your admin if you don&apos;t have VPN credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Once connected, refresh this page to verify access</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Development Mode Notice */}
        {status?.tailscale.environment === 'development' && !status.tailscale.requireTailscale && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">
                  Development Mode
                </h3>
                <p className="text-sm text-yellow-800">
                  Tailscale enforcement is disabled in development. 
                  Set <code className="bg-yellow-100 px-1 rounded">REQUIRE_TAILSCALE=true</code> to test VPN protection locally.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Refresh Status
          </button>
          <Link
            href="/"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
