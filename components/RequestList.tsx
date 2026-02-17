'use client';
import { useState } from 'react';

interface ServiceRequest {
  _id: string;
  serviceType: string;
  description: string;
  priceAgreed: number;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID';
  userId?: { name: string; email?: string } | string;
  handymanId?: { name: string; skills?: string[]; hourlyRate?: number; rating?: number } | string;
  createdAt?: string;
}

interface RequestListProps {
  requests: ServiceRequest[];
  role: 'USER' | 'HANDYMAN';
  onUpdate: () => void;
}

export default function RequestList({ requests, role, onUpdate }: RequestListProps) {
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: string) => {
    setError('');
    setLoadingId(id);

    try {
      const res = await fetch(`/api/service-request/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to update request');
        setLoadingId(null);
        return;
      }

      onUpdate();
      setLoadingId(null);
    } catch {
      setError('An error occurred. Please try again.');
      setLoadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No service requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {requests.map((req) => {
        const handymanName = typeof req.handymanId === 'object' ? req.handymanId?.name : 'Unknown';
        const userName = typeof req.userId === 'object' ? req.userId?.name : 'Unknown';
        const isLoading = loadingId === req._id;

        return (
          <div key={req._id} className="p-4 border rounded shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">{req.serviceType}</h3>
              <p className="text-gray-600 mt-1">{req.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className="font-medium">Price:</span> PKR {req.priceAgreed}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <div>
                <span className="font-medium">Payment:</span> {req.paymentStatus}
              </div>
              {role === 'USER' && (
                <div>
                  <span className="font-medium">Handyman:</span> {handymanName}
                </div>
              )}
              {role === 'HANDYMAN' && (
                <div>
                  <span className="font-medium">Customer:</span> {userName}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              {role === 'USER' && req.status !== 'CANCELLED' && req.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleAction(req._id, 'CANCELLED')}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Cancel'}
                </button>
              )}
              {role === 'HANDYMAN' && req.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleAction(req._id, 'ACCEPTED')}
                    disabled={isLoading}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleAction(req._id, 'CANCELLED')}
                    disabled={isLoading}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Reject'}
                  </button>
                </>
              )}
              {role === 'HANDYMAN' && req.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleAction(req._id, 'COMPLETED')}
                  disabled={isLoading}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Mark as Complete'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}