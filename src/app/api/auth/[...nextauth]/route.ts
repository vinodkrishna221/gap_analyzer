import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await connectDB();

                const user = await User.findOne({ email: credentials?.email });
                if (!user) throw new Error('Invalid credentials');

                const isValid = await bcrypt.compare(
                    credentials?.password || '',
                    user.passwordHash
                );
                if (!isValid) throw new Error('Invalid credentials');

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.profile.name
                };
            }
        })
    ],
    session: {
        strategy: 'jwt' as const,
        maxAge: 24 * 60 * 60 // 24 hours
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
