import { canManageTournament } from '../../utils/auth-check'
import { getDatabase } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  
  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament ID is required'
    })
  }
  
  // Check permissions to manage this tournament
  await canManageTournament(event, tournamentId)
  
  try {
    // Check if tournament exists
    const tournament = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId)
    if (!tournament) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tournament not found'
      })
    }
    
    // Delete tournament (cascades to couples and matches due to foreign key constraints)
    const result = db.prepare('DELETE FROM tournaments WHERE id = ?').run(tournamentId)
    
    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tournament not found'
      })
    }
    
    return { success: true, message: 'Tournament deleted successfully' }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Tournament not found')) {
      throw error
    }
    console.error('Tournament deletion error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete tournament'
    })
  }
})
