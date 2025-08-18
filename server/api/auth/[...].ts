import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { authenticateUser, findOrCreateOAuthUser, updateUserRole, getUserById } from '../../utils/users'

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile'
        }
      }
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point  
    CredentialsProvider.default({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const username = credentials.username as string
        const password = credentials.password as string

        // Authenticate existing user
        const user = await authenticateUser(username, password)
        
        if (user) {
          return {
            id: user.id!.toString(),
            name: user.name || user.username,
            email: user.email,
            username: user.username,
            role: user.role
          }
        }
        
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      if (user) {
        // For Google OAuth users
        if (account?.provider === 'google') {
          const runtimeConfig = useRuntimeConfig()
          const adminEmail = runtimeConfig.adminEmail
          
          // Find or create OAuth user in database
          const dbUser = findOrCreateOAuthUser(
            user.email,
            user.name || 'OAuth User',
            user.image,
            'google',
            user.id
          )
          
          // Update role in database if this is the admin user and not already admin
          if (user.email === adminEmail && dbUser.role !== 'admin') {
            updateUserRole(dbUser.id!, 'admin')
            // Refresh the user data after role update
            const updatedUser = getUserById(dbUser.id!)
            if (updatedUser) {
              token.role = updatedUser.role
            }
          } else {
            token.role = dbUser.role
          }
          
          token.username = dbUser.username || user.email.split('@')[0]
          token.dbId = dbUser.id
          token.profileCompleted = dbUser.profile_completed || false
        } else {
          // For credentials users
          token.role = user.role
          token.username = user.username
          token.dbId = user.dbId
          token.profileCompleted = true // Credentials users have completed profile
        }
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.username = token.username
        session.user.dbId = token.dbId
        session.user.profileCompleted = token.profileCompleted
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
})
