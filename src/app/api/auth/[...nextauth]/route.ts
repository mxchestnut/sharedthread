import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    })
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user role and other info to session
      if (session.user && user) {
        session.user.id = user.id
        // Set you as admin by email
        session.user.role = user.email === 'kitchestnut@hotmail.com' ? 'admin' : 'user'
      }
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('NextAuth signIn callback:', { 
        userEmail: user.email, 
        userName: user.name,
        accountProvider: account?.provider,
        profileEmail: profile?.email 
      });
      
      // Allow sign-in for your email, others need approval
      if (user.email === 'kitchestnut@hotmail.com') {
        console.log('Admin user signing in');
        return true
      }
      
      // Temporarily allow all users for debugging
      console.log('Non-admin user signing in, allowing for debug');
      return true
      
      // Original restrictive logic (commented out for debugging):
      // return false
    }
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: "database"
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }