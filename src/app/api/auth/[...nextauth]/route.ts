import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/services/authService';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const response = await authService.login({
            username: credentials.username,
            password: credentials.password
          });

          if (response.user) {
            return {
              id: response.user.id,
              name: `${response.user.username}`,
              email: response.user.email,
              role: response.user.role,
              username: response.user.username,
              token: response.token,
              client: response.user.client,
              employee: response.user.employee
            };
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.accessToken = user.token;
        token.client = user.client;
        token.employee = user.employee;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.accessToken = token.accessToken as string;
        session.user.client = token.client;
        session.user.employee = token.employee;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
});

export { handler as GET, handler as POST };