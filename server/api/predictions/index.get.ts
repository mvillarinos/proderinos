export default defineEventHandler(async (event) => {
  const db = getDatabase()
  
  try {
    const query = getQuery(event)
    const profileId = query.profile_id ? Number(query.profile_id) : undefined
    const matchId = query.match_id ? Number(query.match_id) : undefined
    const tournamentId = query.tournament_id ? Number(query.tournament_id) : undefined
    
    let sqlQuery = `
      SELECT 
        mp.id,
        mp.match_id,
        mp.profile_id,
        mp.predicted_winner_id,
        mp.predicted_score_couple1,
        mp.predicted_score_couple2,
        mp.points_earned,
        mp.created_at,
        mp.updated_at,
        u.name as profile_name,
        u.avatar_url as profile_avatar,
        m.couple1_id,
        m.couple2_id,
        m.status as match_status,
        m.score_couple1 as actual_score_couple1,
        m.score_couple2 as actual_score_couple2,
        m.winner_id as actual_winner_id,
        c1.player1_name as couple1_player1,
        c1.player2_name as couple1_player2,
        c2.player1_name as couple2_player1,
        c2.player2_name as couple2_player2,
        pw.player1_name as predicted_winner_player1,
        pw.player2_name as predicted_winner_player2,
        t.name as tournament_name
      FROM match_predictions mp
      JOIN profiles u ON mp.profile_id = u.id
      JOIN matches m ON mp.match_id = m.id
      JOIN couples c1 ON m.couple1_id = c1.id
      JOIN couples c2 ON m.couple2_id = c2.id
      JOIN couples pw ON mp.predicted_winner_id = pw.id
      JOIN tournaments t ON m.tournament_id = t.id
    `
    
    const conditions: string[] = []
    const params: unknown[] = []
    
    if (profileId) {
      conditions.push('mp.profile_id = ?')
      params.push(profileId)
    }
    
    if (matchId) {
      conditions.push('mp.match_id = ?')
      params.push(matchId)
    }
    
    if (tournamentId) {
      conditions.push('m.tournament_id = ?')
      params.push(tournamentId)
    }
    
    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ')
    }
    
    sqlQuery += ' ORDER BY mp.created_at DESC'
    
    const predictions = db.prepare(sqlQuery).all(...params)
    
    return {
      predictions,
      total: predictions.length
    }
    
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch predictions'
    })
  }
})
