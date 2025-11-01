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
      // Allow sign-in for your email, others need approval
      if (user.email === 'kitchestnut@hotmail.com') {
        return true
      }
      
      // For now, only allow your email (can change later)
      return false
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