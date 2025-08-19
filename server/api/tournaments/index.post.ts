import { requireOrganizatorAuth } from '../../utils/auth-check'
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

export default defineEventHandler(async (event) => {
  // Require organizator or admin authentication for creating tournaments
  const session = await requireOrganizatorAuth(event)
  const user = session.user as ExtendedUser
  
  const db = getDatabase()
  const body = await readBody(event) as Omit<Tournament, 'id' | 'created_at' | 'updated_at'>
  
  // Validate required fields
  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament name is required'
    })
  }
  
  try {
    const insert = db.prepare(`
      INSERT INTO tournaments (
        name, description, start_date, end_date, status, 
        visible, primary_color, background_color, owner_id, organizators_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = insert.run(
      body.name,
      body.description || null,
      body.start_date || null,
      body.end_date || null,
      body.status || 'draft',
      body.visible !== undefined ? body.visible : true,
      body.primary_color || '#3B82F6',
      body.background_color || '#F8FAFC',
      String(user.dbId), // owner_id
      JSON.stringify(body.organizators_id || []) // organizators_id as JSON string
    )
    
    // Get the created tournament
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(result.lastInsertRowid)
    
    return tournament
  } catch (error) {
    console.error('Tournament creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create tournament'
    })
  }
})
