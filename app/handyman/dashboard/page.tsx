'use client';
import { useState, useEffect } from 'react';
import RequestList from '@/components/RequestList';

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

export default function HandymanDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch requests');
        setRequests([]);
        return;
      }
      
      setRequests(data);
    } catch (err) {
      setError('An error occurred while fetching requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Handyman Dashboard</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Handyman Dashboard</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <RequestList requests={requests} role="HANDYMAN" onUpdate={fetchRequests} />
    </div>
  );
}