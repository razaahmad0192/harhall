import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import z from 'zod';

const updateSchema = z.object({
  status: z.enum(['ACCEPTED', 'COMPLETED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PAID']).optional(),
});

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

    await connectDB();
    const request = await ServiceRequest.findById(id)
      .populate('userId', 'name email')
      .populate('handymanId', 'name skills hourlyRate rating');

    if (!request) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    // Check if user has access to this request
    const isHandyman = session.user.role === 'HANDYMAN' && request.handymanId.toString() === session.user.id;
    const isUser = session.user.role === 'USER' && request.userId.toString() === session.user.id;

    if (!isHandyman && !isUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Service request fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const request = await ServiceRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    const isHandyman = session.user.role === 'HANDYMAN' && request.handymanId.toString() === session.user.id;
    const isUser = session.user.role === 'USER' && request.userId.toString() === session.user.id;

    if (!isHandyman && !isUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Handyman can accept/reject/complete; User can cancel
    if (parsed.data.status) {
      if (parsed.data.status === 'COMPLETED' && isHandyman) {
        if (request.status !== 'ACCEPTED') {
          return NextResponse.json(
            { error: 'Can only complete accepted requests' },
            { status: 400 }
          );
        }
        request.status = 'COMPLETED';
        request.paymentStatus = 'PAID';
        
        // Update handyman rating/totalJobs
        const handyman = await User.findById(request.handymanId);
        if (handyman) {
          handyman.totalJobs += 1;
          handyman.rating = (handyman.rating * (handyman.totalJobs - 1) + 5) / handyman.totalJobs;
          await handyman.save();
        }
      } else if (parsed.data.status === 'ACCEPTED' && isHandyman && request.status === 'PENDING') {
        request.status = 'ACCEPTED';
      } else if (parsed.data.status === 'CANCELLED' && (isUser || isHandyman)) {
        if (request.status === 'COMPLETED') {
          return NextResponse.json(
            { error: 'Cannot cancel completed requests' },
            { status: 400 }
          );
        }
        request.status = 'CANCELLED';
      } else {
        return NextResponse.json(
          { error: 'Invalid action for current status' },
          { status: 400 }
        );
      }
    }

    await request.save();
    await request.populate('userId', 'name email');
    await request.populate('handymanId', 'name skills hourlyRate rating');

    return NextResponse.json(request);
  } catch (error) {
    console.error('Service request update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}