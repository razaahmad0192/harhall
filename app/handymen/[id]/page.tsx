import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RequestForm from '@/components/RequestForm';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { notFound } from 'next/navigation';

export default async function HandymanProfile({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Handle both Promise and direct params (Next.js 15 compatibility)
  const resolvedParams = await Promise.resolve(params);
  const handymanId = resolvedParams.id;

  if (!handymanId || !/^[0-9a-fA-F]{24}$/.test(handymanId)) {
    notFound();
  }

  try {
    await connectDB();
    const handyman = await User.findById(handymanId).select('-password');

    if (!handyman || handyman.role !== 'HANDYMAN') {
      notFound();
    }

    const skills = handyman.skills || [];
    const rating = handyman.rating || 0;
    const totalJobs = handyman.totalJobs || 0;
    const hourlyRate = handyman.hourlyRate || 0;
    const experienceYears = handyman.experienceYears || 0;
    const city = handyman.location?.city || 'Not specified';

    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{handyman.name}&apos;s Profile</h1>
              <p className="text-gray-600">Professional Handyman</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${
              handyman.availability 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {handyman.availability ? '✓ Available' : '✗ Not Available'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-700 mb-2 text-sm uppercase">Skills</h2>
              <p className="text-gray-900 font-medium">
                {skills.length > 0 ? (
                  <span className="flex flex-wrap gap-2">
                    {skills.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </span>
                ) : (
                  'No skills listed'
                )}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-700 mb-2 text-sm uppercase">Hourly Rate</h2>
              <p className="text-2xl font-bold text-gray-900">PKR {hourlyRate}<span className="text-sm font-normal">/hr</span></p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-700 mb-2 text-sm uppercase">Experience</h2>
              <p className="text-2xl font-bold text-gray-900">{experienceYears} <span className="text-sm font-normal">years</span></p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-700 mb-2 text-sm uppercase">Rating</h2>
              <p className="text-2xl font-bold text-gray-900">
                {rating.toFixed(1)} ⭐
              </p>
              <p className="text-sm text-gray-600 mt-1">{totalJobs} {totalJobs === 1 ? 'job' : 'jobs'} completed</p>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-700 mb-2 text-sm uppercase">Location</h2>
              <p className="text-gray-900 font-medium">📍 {city}</p>
            </div>
          </div>
        </div>

        {session.user.role === 'USER' && handyman.availability && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Request Service</h2>
            <RequestForm handymanId={handymanId} />
          </div>
        )}

        {session.user.role === 'USER' && !handyman.availability && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-yellow-800 font-medium">This handyman is currently not available for new requests.</p>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching handyman:', error);
    notFound();
  }
}