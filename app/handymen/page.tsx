'use client';
import { useState, useEffect, useCallback } from 'react';
import HandymanCard from '@/components/HandymanCard';

interface Handyman {
  _id: string;
  name: string;
  skills?: string[];
  hourlyRate?: number;
  rating?: number;
  totalJobs?: number;
  location?: {
    city?: string;
  };
  availability?: boolean;
}

export default function Handymen() {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchHandymen = useCallback(async () => {
    try {
      setError('');
      setSearching(true);
      const params = new URLSearchParams();
      if (skill.trim()) params.append('skill', skill.trim());
      if (location.trim()) params.append('location', location.trim());
      
      const res = await fetch(`/api/handymen?${params.toString()}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch handymen');
        setHandymen([]);
        return;
      }
      
      setHandymen(data);
    } catch {
      setError('An error occurred while fetching handymen');
      setHandymen([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [skill, location]);

  useEffect(() => {
    fetchHandymen();
  }, [fetchHandymen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchHandymen();
  };

  if (loading && handymen.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Find Handymen</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Find Handymen</h1>
      
      <form onSubmit={handleSearch} className="mb-6 flex gap-2 flex-wrap">
        <input
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Skill (e.g., plumbing, electrical)"
          className="flex-1 min-w-[200px] p-2 border rounded"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (city)"
          className="flex-1 min-w-[200px] p-2 border rounded"
        />
        <button
          type="submit"
          disabled={searching}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${searching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {handymen.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No handymen found. Try adjusting your search criteria.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {handymen.map((h) => (
          <HandymanCard key={h._id} handyman={h} />
        ))}
      </div>
    </div>
  );
}