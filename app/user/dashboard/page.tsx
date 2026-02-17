import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
import User from '@/models/User';
import Link from 'next/link';

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'USER') redirect('/login');

  await connectDB();

  const requests = await ServiceRequest.find({ userId: session.user.id })
    .populate('handymanId', 'name skills hourlyRate rating')
    .lean();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Dashboard</h1>
        <p className="text-gray-600">Manage your service requests and find handymen</p>
      </div>

      <div className="mb-6">
        <Link
          href="/handymen"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
        >
          🔍 Find Handymen
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Service Requests</h2>
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No service requests yet.</p>
            <Link
              href="/handymen"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find a Handyman
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req: any) => {
              const handymanName = typeof req.handymanId === 'object' ? req.handymanId?.name : 'Unknown';
              const statusColors: Record<string, string> = {
                PENDING: 'bg-yellow-100 text-yellow-800',
                ACCEPTED: 'bg-blue-100 text-blue-800',
                COMPLETED: 'bg-green-100 text-green-800',
                CANCELLED: 'bg-red-100 text-red-800',
              };
              return (
                <div key={req._id} className="border border-gray-200 p-5 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{req.serviceType}</h3>
                      <p className="text-gray-600 mt-1">{req.description || 'No description'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[req.status] || 'bg-gray-100 text-gray-800'}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Handyman:</span>
                      <p className="font-medium text-gray-900">{handymanName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <p className="font-medium text-gray-900">PKR {req.priceAgreed}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment:</span>
                      <p className="font-medium text-gray-900">{req.paymentStatus}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="font-medium text-gray-900">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
