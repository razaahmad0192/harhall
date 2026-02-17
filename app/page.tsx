import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-3xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          HarHall
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find reliable, skilled handymen near you. Get your projects done quickly and professionally.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">🔍 Find Experts</h3>
            <p className="text-gray-600">Browse skilled handymen in your area</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">⚡ Quick Service</h3>
            <p className="text-gray-600">Get your projects done fast</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">⭐ Verified Reviews</h3>
            <p className="text-gray-600">Choose from top-rated professionals</p>
          </div>
        </div>
      </div>
    </div>
  );
}