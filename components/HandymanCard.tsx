import Link from 'next/link';

interface HandymanCardProps {
  handyman: {
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
  };
}

export default function HandymanCard({ handyman }: HandymanCardProps) {
  const skills = handyman.skills || [];
  const rating = handyman.rating || 0;
  const totalJobs = handyman.totalJobs || 0;
  const hourlyRate = handyman.hourlyRate || 0;
  const city = handyman.location?.city || 'Location not specified';

  return (
    <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-bold">{handyman.name}</h2>
        {!handyman.availability && (
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Unavailable</span>
        )}
      </div>
      
      {skills.length > 0 && (
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Skills:</span> {skills.join(', ')}
        </p>
      )}
      
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="font-medium">Rate:</span> PKR {hourlyRate}/hr
        </div>
        <div>
          <span className="font-medium">Rating:</span> {rating.toFixed(1)} ⭐
        </div>
        <div>
          <span className="font-medium">Jobs:</span> {totalJobs}
        </div>
        <div>
          <span className="font-medium">Location:</span> {city}
        </div>
      </div>
      
      <Link
        href={`/handymen/${handyman._id}`}
        className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center"
      >
        View Profile
      </Link>
    </div>
  );
}