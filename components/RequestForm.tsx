'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RequestFormProps {
  handymanId: string;
}

export default function RequestForm({ handymanId }: RequestFormProps) {
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [priceAgreed, setPriceAgreed] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!serviceType.trim() || !description.trim() || !priceAgreed || Number(priceAgreed) <= 0) {
      setError('Please fill in all fields with valid values');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handymanId,
          serviceType: serviceType.trim(),
          description: description.trim(),
          priceAgreed: Number(priceAgreed),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to create service request');
        setLoading(false);
        return;
      }

      router.push('/user/requests');
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <input
        type="text"
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
        placeholder="Service Type"
        required
        className="w-full mb-4 p-2 border rounded"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
        rows={4}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="number"
        value={priceAgreed}
        onChange={(e) => setPriceAgreed(e.target.value)}
        placeholder="Agreed Price"
        required
        min="0"
        step="0.01"
        className="w-full mb-4 p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 bg-green-500 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Submitting...' : 'Request Service'}
      </button>
    </form>
  );
}