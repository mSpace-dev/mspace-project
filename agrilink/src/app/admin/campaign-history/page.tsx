'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface EmailCampaign {
  _id: string;
  subject: string;
  message: string;
  sentAt: string;
  sentToCount: number;
  sentBy: string;
  status: 'sent' | 'failed' | 'partial';
  errorCount?: number;
  campaignType: 'manual' | 'automated';
}

interface CampaignStats {
  totalCampaigns: number;
  totalEmailsSent: number;
  successfulCampaigns: number;
  failedCampaigns: number;
  partialCampaigns: number;
}

interface ApiResponse {
  campaigns: EmailCampaign[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCampaigns: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics: CampaignStats;
}

export default function CampaignHistory() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  const fetchCampaigns = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email/campaign-history?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaign history');
      }

      const result = await response.json();
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`/api/email/campaign-history?id=${campaignId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCampaigns(currentPage); // Refresh the list
        setSelectedCampaign(null);
      } else {
        alert('Failed to delete campaign');
      }
    } catch (err) {
      alert('Error deleting campaign');
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getStatusBadge = (status: string, errorCount?: number) => {
    const badges = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
        {errorCount && errorCount > 0 && ` (${errorCount} failed)`}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Campaign History</h1>
          <p className="text-gray-600 mt-2">View all sent email campaigns and their performance</p>
        </div>

        {/* Statistics Cards */}
        {data?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
              <p className="text-2xl font-bold text-gray-900">{data.statistics.totalCampaigns}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Emails Sent</h3>
              <p className="text-2xl font-bold text-blue-600">{data.statistics.totalEmailsSent}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Successful</h3>
              <p className="text-2xl font-bold text-green-600">{data.statistics.successfulCampaigns}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Failed</h3>
              <p className="text-2xl font-bold text-red-600">{data.statistics.failedCampaigns}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Partial</h3>
              <p className="text-2xl font-bold text-yellow-600">{data.statistics.partialCampaigns}</p>
            </div>
          </div>
        )}

        {/* Campaign List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Campaigns</h2>
          </div>

          {data?.campaigns.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No email campaigns found. Send your first campaign to see it here!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.campaigns.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {campaign.subject}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {campaign.message.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(campaign.sentAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.sentToCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(campaign.status, campaign.errorCount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.sentBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteCampaign(campaign._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => fetchCampaigns(currentPage - 1)}
                  disabled={!data.pagination.hasPrevPage}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchCampaigns(currentPage + 1)}
                  disabled={!data.pagination.hasNextPage}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Detail Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-sm text-gray-900">{selectedCampaign.subject}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <div className="mt-1 p-3 border rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCampaign.message}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sent At</label>
                      <p className="text-sm text-gray-900">
                        {format(new Date(selectedCampaign.sentAt), 'PPpp')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recipients</label>
                      <p className="text-sm text-gray-900">{selectedCampaign.sentToCount} emails</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      {getStatusBadge(selectedCampaign.status, selectedCampaign.errorCount)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sent By</label>
                      <p className="text-sm text-gray-900">{selectedCampaign.sentBy}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
