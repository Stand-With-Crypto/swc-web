import { nextAuthConfig } from '@/utils/server/nextAuthConfig'
import NextAuth from 'next-auth'

const handler = NextAuth(nextAuthConfig)

export { handler as GET, handler as POST }
