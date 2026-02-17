'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  if (!session) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              HarHall
            </Link>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const userRole = session.user?.role;
  const dashboardLink = userRole === 'USER' ? '/user/dashboard' : '/handyman/dashboard';
  const requestsLink = userRole === 'USER' ? '/user/requests' : '/handyman/requests';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
            HarHall
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href={dashboardLink}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            {userRole === 'USER' && (
              <Link
                href="/handymen"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Find Handymen
              </Link>
            )}
            <Link
              href={requestsLink}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              My Requests
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {session.user?.name || session.user?.email}
              </span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {userRole}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href={dashboardLink}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            {userRole === 'USER' && (
              <Link
                href="/handymen"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Handymen
              </Link>
            )}
            <Link
              href={requestsLink}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              My Requests
            </Link>
            <div className="px-4 py-2 border-t">
              <div className="mb-2">
                <p className="text-sm text-gray-600">{session.user?.name || session.user?.email}</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {userRole}
                </span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

