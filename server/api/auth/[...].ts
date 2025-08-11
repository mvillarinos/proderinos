import { NuxtAuthHandler } from '#auth'

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
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

        // Check if this is the first user - if so, create admin account
        const userCount = getUsersCount()
        
        if (userCount === 0) {
          try {
            const firstUser = await createUser({
              username,
              email: `${username}@villabet.local`,
              password,
              role: 'admin',
              name: 'Admin User'
            })
            
            return {
              id: firstUser.id!.toString(),
              name: firstUser.name || firstUser.username,
              email: firstUser.email,
              username: firstUser.username,
              role: firstUser.role
            }
          } catch (error) {
            console.error('Failed to create first user:', error)
            return null
          }
        }

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
    }
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login'
  }
})
