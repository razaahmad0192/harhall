import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = req.nextUrl;
    const skill = searchParams.get('skill');
    const location = searchParams.get('location');

    const query: Record<string, unknown> = { role: 'HANDYMAN', availability: true };
    if (skill) {
      query.skills = { $in: [skill] };
    }
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    const handymen = await User.find(query)
      .select('-password')
      .sort({ rating: -1, totalJobs: -1 });

    return NextResponse.json(handymen);
  } catch (error) {
    console.error('Handymen fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}