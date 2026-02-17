'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      const role = session.user.role;
      if (role === 'USER') {
        router.push('/user/dashboard');
      } else if (role === 'HANDYMAN') {
        router.push('/handyman/dashboard');
      }
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', { 
        email, 
        password, 
        redirect: false 
      });

      if (result?.error) {
        console.error('Sign in error:', result.error);
        setError(result.error === 'CredentialsSignin' 
          ? 'Invalid email or password' 
          : 'An error occurred during login. Please try again.');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Force a session update and redirect
        router.refresh();
        
        // Small delay to ensure session is updated, then redirect
        setTimeout(() => {
          // The middleware will handle role-based redirect
          window.location.href = '/user/dashboard';
        }, 300);
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
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
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 bg-blue-500 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">Register</a>
        </p>
      </form>
    </div>
  );
}