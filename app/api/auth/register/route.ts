import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import z from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'HANDYMAN']),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
  experienceYears: z.number().min(0, 'Experience years cannot be negative').optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { role } = parsed.data;
    if (role === 'HANDYMAN') {
      if (!parsed.data.skills || parsed.data.skills.length === 0) {
        return NextResponse.json(
          { error: 'Handyman must provide at least one skill' },
          { status: 400 }
        );
      }
      if (!parsed.data.hourlyRate || parsed.data.hourlyRate <= 0) {
        return NextResponse.json(
          { error: 'Handyman must provide a valid hourly rate' },
          { status: 400 }
        );
      }
      if (parsed.data.experienceYears === undefined || parsed.data.experienceYears < 0) {
        return NextResponse.json(
          { error: 'Handyman must provide experience years' },
          { status: 400 }
        );
      }
    }

    const existingUser = await User.findOne({ email: parsed.data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const user = new User(parsed.data);
    await user.save();
    
    // Don't return password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}