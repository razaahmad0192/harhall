'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
      if (mode === 'login') {
        const res = await signIn('credentials', { email, password, redirect: false });
        if (res?.error) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }
        if (res?.ok) {
          // Fetch user role to redirect correctly
          const userRes = await fetch('/api/dashboard');
          if (userRes.ok) {
            const data = await userRes.json();
            // Determine role from session - will be set by NextAuth
            // For now, redirect based on what we get from dashboard
            router.push('/user/dashboard');
            router.refresh();
          } else {
            router.push('/user/dashboard');
          }
        }
      } else {
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
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      
      {mode === 'register' && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full mb-4 p-2 border rounded"
        />
      )}
      
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
      
      {mode === 'register' && (
        <>
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
        </>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 text-white rounded ${mode === 'login' ? 'bg-blue-500' : 'bg-green-500'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  );
}

