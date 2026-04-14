import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_secret",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET || "very_secret_nextauth_key",
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await dbConnect();
                let existingUser = await User.findOne({ email: user.email });
                
                if (!existingUser) {
                    existingUser = await User.create({
                        name: user.name,
                        email: user.email,
                        password: "GOOGLE_OAUTH_NO_PASSWORD",
                        role: "mentee", // Default role
                        isEmailVerified: true // Pre-verified via Google
                    });
                }

                (user as any).id = existingUser._id.toString();
                (user as any).role = existingUser.role;
                
                // Store role in session for redirect logic
                (user as any).redirectUrl = `/login/${existingUser.role}`;
                
                return true;
            }
            return false;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login/mentee",
    },
    session: {
        strategy: "jwt",
    }
};
