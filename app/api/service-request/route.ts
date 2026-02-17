import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import z from 'zod';

const requestSchema = z.object({
  handymanId: z.string().min(1, 'Handyman ID is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  description: z.string().min(1, 'Description is required'),
  priceAgreed: z.number().positive('Price must be positive'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only users can create service requests' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Validate that handymanId exists and is actually a handyman
    const handyman = await User.findById(parsed.data.handymanId);
    if (!handyman) {
      return NextResponse.json({ error: 'Handyman not found' }, { status: 404 });
    }

    if (handyman.role !== 'HANDYMAN') {
      return NextResponse.json({ error: 'Selected user is not a handyman' }, { status: 400 });
    }

    // Check if handyman is available
    if (!handyman.availability) {
      return NextResponse.json({ error: 'Handyman is not available' }, { status: 400 });
    }

    const request = new ServiceRequest({
      ...parsed.data,
      userId: session.user.id,
    });
    
    await request.save();
    await request.populate('handymanId', 'name skills hourlyRate rating');
    await request.populate('userId', 'name email');

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error('Service request creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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
    console.error('Service request fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}