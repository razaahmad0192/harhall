import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const query = session.user.role === 'USER'
      ? { userId: session.user.id }
      : { handymanId: session.user.id };

    const requests = await ServiceRequest.find(query)
      .populate('userId', 'name email')
      .populate('handymanId', 'name skills hourlyRate rating')
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}