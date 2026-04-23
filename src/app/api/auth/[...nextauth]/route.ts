import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      if (account?.provider === 'google' && profile) {
        token.picture = (profile as any).picture || (profile as any).image || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = (token.picture as string) || null
      }
      return session
    },
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email }
          })
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                password: '',
                emailVerified: true
              }
            })
          }
        } catch (error) {
          console.error('Error creating Google user:', error)
          return false
        }
      }
      return true
    }
  }
})

export { handler as GET, handler as POST }
