import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email: String(credentials.email).trim().toLowerCase() }, { phone: String(credentials.email).trim() }],
            },
          });
          if (user) {
            const isPasswordCorrect = user.password ? await bcrypt.compare(credentials.password, user.password) : false;
            if (isPasswordCorrect) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
              };
            }
          }
        } catch (err: any) {
          throw new Error(err);
        }
        return null;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })] : []),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "credentials") {
        return true;
      }
      
      // Handle OAuth providers
      if (account?.provider === "google") {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findFirst({
            where: {
              email: user.email!,
            },
          });

          let accountUser = existingUser;
          if (!accountUser) {
            // Create new user for OAuth providers
            accountUser = await prisma.user.create({
              data: {
                id: nanoid(),
                email: user.email!,
                name: user.name,
                image: user.image,
                role: "user",
                // OAuth users don't have passwords
                password: null,
              },
            });
          }
          user.id = accountUser.id;
          user.role = accountUser.role;
          user.permissions = accountUser.permissions;
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.permissions = user.permissions;
        token.iat = Math.floor(Date.now() / 1000); // Issued at time
      }

      if (token.id) {
        const currentUser = await prisma.user.findUnique({ where: { id: token.id } });
        if (currentUser) {
          token.role = currentUser.role;
          token.permissions = currentUser.permissions;
          token.email = currentUser.email;
          token.name = currentUser.name;
        }
      }
      
      // Check if token is expired (15 minutes)
      const now = Math.floor(Date.now() / 1000);
      const tokenAge = now - (token.iat as number);
      const maxAge = 15 * 60; // 15 minutes
      
      if (tokenAge > maxAge) {
        // Token expired, return empty object to force re-authentication
        return {};
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.permissions = token.permissions as string[];
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = typeof token.picture === "string" && !token.picture.startsWith("data:") ? token.picture : "";
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on auth errors
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 15 * 60, // 15 minutes in seconds
    updateAge: 5 * 60, // Update session every 5 minutes
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes in seconds
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };