import type { H3Event } from 'h3'
import { getServerSession } from '#auth'
import { getDatabase } from './database'

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

export async function requireOrganizatorAuth(event: H3Event) {
  const session = await requireAuth(event)
  
  // Type assertion to access our extended user properties
  const user = session.user as ExtendedUser
  
  if (user.role !== 'organizator' && user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Organizator or admin privileges required'
    })
  }
  
  return session
}

export async function canManageTournament(event: H3Event, tournamentId: string | number): Promise<{ canManage: boolean, session: Awaited<ReturnType<typeof requireAuth>> }> {
  const session = await requireAuth(event)
  const user = session.user as ExtendedUser
  
  // Admins can manage any tournament
  if (user.role === 'admin') {
    return { canManage: true, session }
  }
  
  // For organizators, check if they own or are part of the tournament
  if (user.role === 'organizator') {
    const db = getDatabase()
    const tournament = db.prepare('SELECT owner_id, organizators_id FROM tournaments WHERE id = ?').get(tournamentId) as { owner_id: string, organizators_id: string } | undefined
    
    if (!tournament) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tournament not found'
      })
    }
    
    const userId = String(user.dbId)
    const organizatorsId = tournament.organizators_id ? JSON.parse(tournament.organizators_id) : []
    
    const canManage = tournament.owner_id === userId || organizatorsId.includes(userId)
    
    if (!canManage) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to manage this tournament'
      })
    }
    
    return { canManage: true, session }
  }
  
  throw createError({
    statusCode: 403,
    statusMessage: 'Insufficient privileges to manage tournaments'
  })
}

export async function checkUserRole(event: H3Event, requiredRole: string) {
  const session = await getAuthSession(event)
  
  if (!session?.user) {
    return false
  }
  
  const user = session.user as ExtendedUser
  return user.role === requiredRole
}
