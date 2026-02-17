'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('USER' | 'HANDYMAN')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (allowedRoles && session.user?.role && !allowedRoles.includes(session.user.role as 'USER' | 'HANDYMAN')) {
      router.push('/');
      return;
    }
  }, [session, status, router, allowedRoles]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  if (allowedRoles && session.user?.role && !allowedRoles.includes(session.user.role as 'USER' | 'HANDYMAN')) {
    return null;
  }

  return <>{children}</>;
}

