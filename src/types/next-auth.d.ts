import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'admin' | 'employee' | 'client';
      username: string;
      client?: any;
      employee?: any;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    role: 'admin' | 'employee' | 'client';
    username: string;
    token: string;
    client?: any;
    employee?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'employee' | 'client';
    username: string;
    accessToken: string;
    client?: any;
    employee?: any;
  }
}