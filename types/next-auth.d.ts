import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: 'USER' | 'HANDYMAN';
    };
  }

  interface User {
    id: string;
    role?: 'USER' | 'HANDYMAN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'USER' | 'HANDYMAN';
  }
}

