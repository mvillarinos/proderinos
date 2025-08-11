export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  
  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament ID is required'
    })
  }
  
  try {
    // Check if tournament exists
    const tournament = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId)
    if (!tournament) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tournament not found'
      })
    }
    
    const couples = db.prepare(`
      SELECT * FROM couples 
      WHERE tournament_id = ? 
      ORDER BY created_at ASC
    `).all(tournamentId)
    
    return couples
  } catch (error) {
    if (error instanceof Error && error.message.includes('Tournament not found')) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch couples'
    })
  }
})
