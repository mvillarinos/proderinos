
interface MatchRecord {
  id: number
  couple1_id: number
  couple2_id: number
  score_couple1?: number
  score_couple2?: number
  status: string
}

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  const matchId = getRouterParam(event, 'matchId')
  const body = await readBody(event) as {
    score_couple1?: number
    score_couple2?: number
    winner_id?: number
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  }
  
  if (!tournamentId || !matchId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament ID and Match ID are required'
    })
  }
  
  try {
    // Check if match exists and belongs to tournament
    const match = db.prepare(`
      SELECT id, couple1_id, couple2_id, score_couple1, score_couple2, status
      FROM matches 
      WHERE id = ? AND tournament_id = ?
    `).get(matchId, tournamentId) as MatchRecord | undefined
    
    if (!match) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Match not found'
      })
    }
    
    // Build update query dynamically for partial updates
    const updates: string[] = []
    const values: (string | number | null)[] = []
    
    // Use existing scores if not provided in the update
    const finalScore1 = body.score_couple1 !== undefined ? body.score_couple1 : match.score_couple1
    const finalScore2 = body.score_couple2 !== undefined ? body.score_couple2 : match.score_couple2
    
    if (body.score_couple1 !== undefined) {
      updates.push('score_couple1 = ?')
      values.push(body.score_couple1)
    }
    
    if (body.score_couple2 !== undefined) {
      updates.push('score_couple2 = ?')
      values.push(body.score_couple2)
    }
    
    if (body.status !== undefined) {
      updates.push('status = ?')
      values.push(body.status)
    }
    
    // Handle winner logic
    let winnerId = body.winner_id
    
    // Validate winner_id if provided
    if (winnerId && winnerId !== match.couple1_id && winnerId !== match.couple2_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Winner must be one of the participating couples'
      })
    }
    
    // Auto-determine winner if scores are available and different
    if (!winnerId && finalScore1 !== undefined && finalScore2 !== undefined && finalScore1 !== finalScore2) {
      winnerId = finalScore1 > finalScore2 ? match.couple1_id : match.couple2_id
    }
    
    if (winnerId !== undefined) {
      updates.push('winner_id = ?')
      values.push(winnerId)
    }
    
    // Only update if there are changes
    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update'
      })
    }
    
    // Add timestamp for any update
    updates.push('played_at = CURRENT_TIMESTAMP')
    values.push(matchId)
    
    // Execute update
    const updateQuery = `UPDATE matches SET ${updates.join(', ')} WHERE id = ?`
    db.prepare(updateQuery).run(...values)
    
    // Return updated match with couple details
    const updatedMatch = db.prepare(`
      SELECT 
        m.*,
        c1.player1_name as couple1_player1,
        c1.player2_name as couple1_player2,
        c2.player1_name as couple2_player1,
        c2.player2_name as couple2_player2,
        w.player1_name as winner_player1,
        w.player2_name as winner_player2
      FROM matches m
      JOIN couples c1 ON m.couple1_id = c1.id
      JOIN couples c2 ON m.couple2_id = c2.id
      LEFT JOIN couples w ON m.winner_id = w.id
      WHERE m.id = ?
    `).get(matchId)
    
    return updatedMatch
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Match not found') || 
      error.message.includes('Winner must be one') ||
      error.message.includes('No fields to update')
    )) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update match result'
    })
  }
})
