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
    `).get(tournamentId)
    
    if (!tournament) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tournament not found'
      })
    }
    
    return tournament
  } catch (error) {
    if (error instanceof Error && error.message.includes('Tournament not found')) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tournament'
    })
  }
})
