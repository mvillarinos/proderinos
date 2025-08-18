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
  const session = await getAuthSession(event)
  
  try {
    let query = `
      SELECT 
        t.*,
        COUNT(c.id) as couples_count,
        COUNT(m.id) as matches_count
      FROM tournaments t
      LEFT JOIN couples c ON t.id = c.tournament_id
      LEFT JOIN matches m ON t.id = m.tournament_id
    `
    
    // If user is not authenticated or is a regular player, only show visible tournaments
    if (!session?.user || (session.user as ExtendedUser).role === 'player') {
      query += ` WHERE t.visible = 1`
    }
    // If user is organizator, show tournaments they can manage + visible ones
    else if ((session.user as ExtendedUser).role === 'organizator') {
      const userId = String((session.user as ExtendedUser).dbId)
      query += ` WHERE (t.visible = 1 OR t.owner_id = ? OR JSON_EXTRACT(t.organizators_id, '$') LIKE '%${userId}%')`
    }
    // Admins can see all tournaments (no WHERE clause needed)
    
    query += `
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `
    
    let tournaments
    if (!session?.user || (session.user as ExtendedUser).role === 'player') {
      tournaments = db.prepare(query).all() as TournamentWithCounts[]
    } else if ((session.user as ExtendedUser).role === 'organizator') {
      const userId = String((session.user as ExtendedUser).dbId)
      tournaments = db.prepare(query).all(userId) as TournamentWithCounts[]
    } else {
      tournaments = db.prepare(query).all() as TournamentWithCounts[]
    }
    
    // Parse organizators_id JSON for each tournament
    return tournaments.map((tournament: TournamentWithCounts) => ({
      ...tournament,
      organizators_id: tournament.organizators_id ? JSON.parse(tournament.organizators_id) : []
    }))
  } catch (error) {
    console.error('Tournament fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tournaments'
    })
  }
})
