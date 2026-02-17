import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Handyman ID is required' }, { status: 400 });
    }

    await connectDB();
    const handyman = await User.findById(id).select('-password');
    
    if (!handyman) {
      return NextResponse.json({ error: 'Handyman not found' }, { status: 404 });
    }
    
    if (handyman.role !== 'HANDYMAN') {
      return NextResponse.json({ error: 'User is not a handyman' }, { status: 404 });
    }

    return NextResponse.json(handyman);
  } catch (error) {
    console.error('Handyman fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}