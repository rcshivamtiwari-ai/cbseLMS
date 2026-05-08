import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import { User } from '@/models/index';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          await connectDB();
          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
          if (!user || !user.isActive) return null;
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;
          User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).exec();
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            class: user.class,
            rollNumber: user.rollNumber,
            section: user.section || 'A',
          };
        } catch (err) {
          console.error('Auth error:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.class = user.class;
        token.rollNumber = user.rollNumber;
        token.section = user.section;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.class = token.class;
        session.user.rollNumber = token.rollNumber;
        session.user.section = token.section;
      }
      return session;
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
