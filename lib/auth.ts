import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is not defined');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            console.error('User not found:', credentials.email);
            return null;
          }

          const isPasswordValid = await user.comparePassword(credentials.password);
          
          if (!isPasswordValid) {
            console.error('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('User authenticated successfully:', user.email, user.role);

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'HANDYMAN';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);