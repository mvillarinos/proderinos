import type { H3Event } from 'h3'
import { getServerSession } from '#auth'

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string
  role?: 'admin' | 'organizator' | 'player'
  dbId?: string | number
  profileCompleted?: boolean
}

// Modern auth utility for API routes using @sidebase/nuxt-auth
export async function getAuthSession(event: H3Event) {
  try {
    const session = await getServerSession(event)
    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export async function requireAuth(event: H3Event) {
  const session = await getAuthSession(event)
  
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  return session
}

export async function requireAdminAuth(event: H3Event) {
  const session = await requireAuth(event)
  
  // Type assertion to access our extended user properties
  const user = session.user as ExtendedUser
  
  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required'
    })
  }
  
  return session
}

export async function checkUserRole(event: H3Event, requiredRole: string) {
  const session = await getAuthSession(event)
  
  if (!session?.user) {
    return false
  }
  
  const user = session.user as ExtendedUser
  return user.role === requiredRole
}
