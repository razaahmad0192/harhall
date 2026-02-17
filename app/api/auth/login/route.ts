import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// This route is not needed since NextAuth handles login via the authorize callback
// But keeping it for backward compatibility or if needed for API-only access
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Return user info (without password)
    // Note: For actual session creation, use NextAuth's signIn from client side
    return NextResponse.json({ 
      user: { 
        id: user._id.toString(), 
        name: user.name,
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}