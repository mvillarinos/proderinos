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
    
    // Get match statistics
    const matchStats = db.prepare(`
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_matches,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_matches,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_matches
      FROM matches 
      WHERE tournament_id = ?
    `).get(tournamentId)
    
    // Get couple standings (wins, losses, points)
    const coupleStats = db.prepare(`
      SELECT 
        c.id,
        c.player1_name,
        c.player2_name,
        COUNT(m.id) as total_matches,
        COUNT(CASE WHEN m.winner_id = c.id THEN 1 END) as wins,
        COUNT(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != c.id THEN 1 END) as losses,
        COALESCE(SUM(CASE WHEN m.couple1_id = c.id THEN m.score_couple1 ELSE m.score_couple2 END), 0) as points_for,
        COALESCE(SUM(CASE WHEN m.couple1_id = c.id THEN m.score_couple2 ELSE m.score_couple1 END), 0) as points_against
      FROM couples c
      LEFT JOIN matches m ON (m.couple1_id = c.id OR m.couple2_id = c.id) AND m.status = 'completed'
      WHERE c.tournament_id = ?
      GROUP BY c.id, c.player1_name, c.player2_name
      ORDER BY wins DESC, (points_for - points_against) DESC
    `).all(tournamentId)
    
    return {
      tournament_id: tournamentId,
      match_stats: matchStats,
      standings: coupleStats
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Tournament not found')) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tournament statistics'
    })
  }
})
