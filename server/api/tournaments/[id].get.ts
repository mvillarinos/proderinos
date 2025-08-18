import { getAuthSession } from '../../utils/auth-check'
import { getDatabase } from '../../utils/database'

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

interface TournamentWithCounts {
  id: number
  name: string
  description?: string
  start_date?: string
  end_date?: string
  status: string
  visible: boolean
  primary_color: string
  background_color: string
  owner_id: string
  organizators_id: string
  created_at: string
  updated_at: string
  couples_count: number
  matches_count: number
}

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  const session = await getAuthSession(event)
  
  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament ID is required'
    })
  }
  
  try {
    const tournament = db.prepare(`
      SELECT 
        t.*,
        COUNT(c.id) as couples_count,
        COUNT(m.id) as matches_count
      FROM tournaments t
      LEFT JOIN couples c ON t.id = c.tournament_id
      LEFT JOIN matches m ON t.id = m.tournament_id
      WHERE t.id = ?
      GROUP BY t.id
    `).get(tournamentId) as TournamentWithCounts | undefined
    
    if (!tournament) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tournament not found'
      })
    }
    
    // Check if user can view this tournament
    const user = session?.user as ExtendedUser | undefined
    const userId = user?.dbId ? String(user.dbId) : null
    const organizatorsId = tournament.organizators_id ? JSON.parse(tournament.organizators_id) : []
    
    // If tournament is not visible, only allow access to:
    // - Admins
    // - Tournament owner
    // - Tournament organizators
    if (!tournament.visible) {
      if (!user || user.role === 'player') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Tournament not found'
        })
      }
      
      if (user.role === 'organizator') {
        const canView = tournament.owner_id === userId || organizatorsId.includes(userId)
        if (!canView) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Tournament not found'
          })
        }
      }
    }
    
    // Parse organizators_id JSON
    return {
      ...tournament,
      organizators_id: organizatorsId
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Tournament not found')) {
      throw error
    }
    console.error('Tournament fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tournament'
    })
  }
})
