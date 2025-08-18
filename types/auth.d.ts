declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string
      role?: 'admin' | 'organizator' | 'player'
      dbId?: string | number
      profileCompleted?: boolean
    }
  }

  interface User {
    username?: string
    role?: 'admin' | 'organizator' | 'player'
    dbId?: string | number
    profileCompleted?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string
    role?: 'admin' | 'organizator' | 'player'
    dbId?: string | number
    profileCompleted?: boolean
  }
}

declare module '@sidebase/nuxt-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string
      role?: 'admin' | 'organizator' | 'player'
      dbId?: string | number
      profileCompleted?: boolean
    }
  }

  interface User {
    username?: string
    role?: 'admin' | 'organizator' | 'player'
    dbId?: string | number
    profileCompleted?: boolean
  }
}
