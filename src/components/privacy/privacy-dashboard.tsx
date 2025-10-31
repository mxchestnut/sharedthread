'use client';

import React, { useState, useMemo } from 'react';
import { PrivacyLogger } from '@/lib/privacy-logger';
import { GDPRComplianceManager, GDPRRight, RequestStatus, type GDPRRequest } from '@/lib/gdpr-compliance';
import { logError } from '@/lib/error-logger';


// User privacy dashboard component
export function UserPrivacyDashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'logs' | 'gdpr' | 'settings'>('logs');
  const userLogs = useMemo(() => PrivacyLogger.getUserLogs(userId), [userId]);
  const [gdprRequests, setGdprRequests] = useState<GDPRRequest[]>(() => GDPRComplianceManager.getUserRequests(userId));
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const handleExportData = () => {
    const exportData = PrivacyLogger.exportLogs(exportFormat);
    const blob = new Blob([exportData], { 
      type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-data-${userId}.${exportFormat}`;
    a.click();
  };

  const handleGDPRRequest = async (right: GDPRRight, description: string) => {
    try {
      await GDPRComplianceManager.submitRequest(
        userId,
        'user@example.com', // Would get from user profile
        right,
        description
      );
      
      // Refresh requests
      const requests = GDPRComplianceManager.getUserRequests(userId);
      setGdprRequests(requests);
    } catch (error) {
      logError('Failed to submit GDPR request:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[var(--color-paper)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-2">
          Privacy Dashboard
        </h1>
        <p className="text-[var(--color-charcoal)]">
          Manage your privacy settings and access your data
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--color-pewter)] mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['logs', 'gdpr', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-[var(--color-ink)] text-[var(--color-ink)]'
                  : 'border-transparent text-[var(--color-charcoal)] hover:text-[var(--color-ink)]'
              }`}
            >
              {tab === 'logs' && 'Activity Logs'}
              {tab === 'gdpr' && 'Data Rights'}
              {tab === 'settings' && 'Privacy Settings'}
            </button>
          ))}
        </nav>
      </div>

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                Your Activity Logs
              </h3>
              <div className="flex items-center space-x-4">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                  className="border border-[var(--color-pewter)] rounded px-3 py-1"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <button
                  onClick={handleExportData}
                  className="bg-[var(--color-ink)] text-white px-4 py-2 rounded hover:bg-[var(--color-charcoal)]"
                >
                  Export Data
                </button>
              </div>
            </div>
            
            {userLogs && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Log Entries:</span> {userLogs.logs.length}
                  </div>
                  <div>
                    <span className="font-medium">Audit Events:</span> {userLogs.auditEvents.length}
                  </div>
                </div>
                
                <div className="border-t border-[var(--color-pewter)] pt-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userLogs.logs.slice(-10).reverse().map((log, index) => (
                      <div key={index} className="text-sm border-l-2 border-[var(--color-pewter)] pl-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{log.category}</span>
                          <span className="text-[var(--color-charcoal)]">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[var(--color-charcoal)]">{log.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Privacy Protection</h4>
            <p className="text-blue-800 text-sm">
              Your logs are automatically anonymized to protect your privacy. 
              IP addresses are hashed, and personal identifiers are removed after 
              retention periods expire.
            </p>
          </div>
        </div>
      )}

      {/* GDPR Tab */}
      {activeTab === 'gdpr' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6">
            <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4">
              Your Data Rights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.values(GDPRRight).map((right) => (
                <div key={right} className="border border-[var(--color-pewter)] rounded p-4">
                  <h4 className="font-medium capitalize mb-2">
                    {right.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-[var(--color-charcoal)] mb-3">
                    {getGDPRRightDescription(right)}
                  </p>
                  <button
                    onClick={() => handleGDPRRequest(right, `Request for ${right}`)}
                    className="text-[var(--color-ink)] hover:underline text-sm"
                  >
                    Submit Request
                  </button>
                </div>
              ))}
            </div>

            {gdprRequests.length > 0 && (
              <div className="border-t border-[var(--color-pewter)] pt-6">
                <h4 className="font-medium mb-4">Your Requests</h4>
                <div className="space-y-3">
                  {gdprRequests.map((request) => (
                    <div key={request.id} className="border border-[var(--color-pewter)] rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium capitalize">
                            {request.right.replace('_', ' ')}
                          </span>
                          <div className="text-sm text-[var(--color-charcoal)]">
                            Submitted: {new Date(request.requestDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm mt-2">{request.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Your Rights Under GDPR</h4>
            <p className="text-green-800 text-sm">
              You have the right to access, rectify, erase, restrict, port, and object to 
              the processing of your personal data. Requests are typically processed within 30 days.
            </p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6">
            <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4">
              Privacy Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Activity Logging</h4>
                  <p className="text-sm text-[var(--color-charcoal)]">
                    Allow logging of your account activity for security purposes
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="form-checkbox" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Analytics</h4>
                  <p className="text-sm text-[var(--color-charcoal)]">
                    Help improve the service with anonymous usage analytics
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="form-checkbox" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Security Monitoring</h4>
                  <p className="text-sm text-[var(--color-charcoal)]">
                    Enhanced security monitoring and threat detection
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="form-checkbox" />
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Data Retention</h4>
            <p className="text-yellow-800 text-sm">
              Security logs are retained for 90 days, activity logs for 7 days, 
              and system logs for 30 days. All logs are automatically anonymized 
              according to our privacy schedule.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getGDPRRightDescription(right: GDPRRight): string {
  const descriptions = {
    [GDPRRight.ACCESS]: 'Request a copy of all your personal data',
    [GDPRRight.RECTIFICATION]: 'Correct inaccurate personal data',
    [GDPRRight.ERASURE]: 'Delete your personal data (right to be forgotten)',
    [GDPRRight.RESTRICTION]: 'Limit how your data is processed',
    [GDPRRight.PORTABILITY]: 'Export your data in a portable format',
    [GDPRRight.OBJECTION]: 'Object to certain data processing',
    [GDPRRight.AUTOMATED_DECISION]: 'Review automated decision-making'
  };
  return descriptions[right] || 'Data protection right';
}

function getStatusColor(status: RequestStatus): string {
  const colors = {
    [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [RequestStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [RequestStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [RequestStatus.REJECTED]: 'bg-red-100 text-red-800',
    [RequestStatus.EXPIRED]: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Admin compliance dashboard
export function AdminComplianceDashboard() {
  const [statistics] = useState(() => GDPRComplianceManager.getComplianceStatistics());
  const [logStats] = useState(() => PrivacyLogger.getStatistics());
  type PendingView = GDPRRequest & { expiresSoon: boolean; daysLeft: number };
  const [pendingView] = useState<PendingView[]>(() => {
    const now = Date.now();
    return GDPRComplianceManager.getPendingRequests().map((request) => {
      const daysLeft = Math.ceil((request.expirationDate - now) / (24 * 60 * 60 * 1000));
      const expiresSoon = now > request.expirationDate - 7 * 24 * 60 * 60 * 1000;
      return { ...request, daysLeft, expiresSoon };
    });
  });

  const handleExportCompliance = () => {
    const report = GDPRComplianceManager.exportComplianceReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[var(--color-paper)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-2">
          Compliance Dashboard
        </h1>
        <p className="text-[var(--color-charcoal)]">
          Monitor GDPR compliance and privacy protection metrics
        </p>
      </div>

      {/* Statistics Grid */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6">
            <div className="text-2xl font-bold text-[var(--color-ink)]">
              {statistics.totalRequests}
            </div>
            <div className="text-[var(--color-charcoal)]">Total GDPR Requests</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6">
            <div className="text-2xl font-bold text-[var(--color-ink)]">
              {statistics.complianceRate.toFixed(1)}%
            </div>
            <div className="text-[var(--color-charcoal)]">Compliance Rate</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6">
            <div className="text-2xl font-bold text-[var(--color-ink)]">
              {Math.round(statistics.averageProcessingTime / (24 * 60 * 60 * 1000))}d
            </div>
            <div className="text-[var(--color-charcoal)]">Avg Processing Time</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6">
            <div className="text-2xl font-bold text-[var(--color-ink)]">
              {statistics.pendingOverdue}
            </div>
            <div className="text-[var(--color-charcoal)]">Overdue Requests</div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Pending Requests ({pendingView.length})
          </h3>
          <button
            onClick={handleExportCompliance}
            className="bg-[var(--color-ink)] text-white px-4 py-2 rounded hover:bg-[var(--color-charcoal)]"
          >
            Export Report
          </button>
        </div>
        
        {pendingView.length > 0 ? (
          <div className="space-y-3">
            {pendingView.map((request) => (
              <div key={request.id} className="border border-[var(--color-pewter)] rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium capitalize">
                        {request.right.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-charcoal)] mt-1">
                      User: {request.userId} | Submitted: {new Date(request.requestDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm mt-2">{request.description}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-[var(--color-charcoal)]">
                      Expires: {new Date(request.expirationDate).toLocaleDateString()}
                    </div>
                    <div className={`mt-1 ${
                      request.expiresSoon
                        ? 'text-red-600' : 'text-[var(--color-charcoal)]'
                    }`}>
                      {request.daysLeft} days left
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-charcoal)] text-center py-8">
            No pending requests
          </p>
        )}
      </div>

      {/* Log Statistics */}
      {logStats && (
        <div className="bg-white rounded-lg border border-[var(--color-pewter)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4">
            Privacy Logging Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Log Summary</h4>
              <div className="space-y-1 text-sm">
                <div>Total Logs: {logStats.totalLogs}</div>
                <div>Audit Events: {logStats.totalAuditEvents}</div>
                <div>Retention Compliant: {logStats.retentionCompliance ? '✅' : '❌'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(logStats.categoryCounts).map(([category, count]) => (
                  <div key={category}>
                    {category}: {count as number}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Data Lifecycle</h4>
              <div className="space-y-1 text-sm">
                <div>Oldest Log: {logStats.oldestLog.split('T')[0]}</div>
                <div>Newest Log: {logStats.newestLog.split('T')[0]}</div>
                <div>Auto-cleanup: Active</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}