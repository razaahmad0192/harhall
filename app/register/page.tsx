'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'HANDYMAN'>('USER');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        name,
        email,
        password,
        role,
        location: { city },
        ...(role === 'HANDYMAN' && {
          skills: skills.split(',').map(s => s.trim()).filter(s => s),
          hourlyRate: Number(hourlyRate),
          experienceYears: Number(experienceYears),
        }),
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login');
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
          className="w-full mb-4 p-2 border rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'USER' | 'HANDYMAN')}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="USER">User</option>
          <option value="HANDYMAN">Handyman</option>
        </select>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          required
          className="w-full mb-4 p-2 border rounded"
        />
        {role === 'HANDYMAN' && (
          <>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Skills (comma separated)"
              required
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Hourly Rate"
              required
              min="0"
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              placeholder="Experience Years"
              required
              min="0"
              className="w-full mb-4 p-2 border rounded"
            />
          </>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 bg-green-500 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </form>
    </div>
  );
}