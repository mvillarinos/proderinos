export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  const body = await readBody(event) as Omit<Match, 'id' | 'tournament_id' | 'created_at'>
  
  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament ID is required'
    })
  }
  
  // Validate required fields
  if (!body.couple1_id || !body.couple2_id || body.match_order === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'couple1_id, couple2_id, and match_order are required'
    })
  }
  
  if (body.couple1_id === body.couple2_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A couple cannot play against itself'
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
    
    // Check if both couples exist and belong to the tournament
    const couple1 = db.prepare('SELECT id FROM couples WHERE id = ? AND tournament_id = ?').get(body.couple1_id, tournamentId)
    const couple2 = db.prepare('SELECT id FROM couples WHERE id = ? AND tournament_id = ?').get(body.couple2_id, tournamentId)
    
    if (!couple1 || !couple2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'One or both couples do not exist in this tournament'
      })
    }
    
    // Check if match order is already taken
    const existingMatch = db.prepare('SELECT id FROM matches WHERE tournament_id = ? AND match_order = ?').get(tournamentId, body.match_order)
    if (existingMatch) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Match order already exists'
      })
    }
    
    const insert = db.prepare(`
      INSERT INTO matches (tournament_id, couple1_id, couple2_id, match_order, round_name, score_couple1, score_couple2, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = insert.run(
      tournamentId,
      body.couple1_id,
      body.couple2_id,
      body.match_order,
      body.round_name || 'Round 1',
      body.score_couple1 || 0,
      body.score_couple2 || 0,
      body.status || 'pending'
    )
    
    // Get the created match with couple details
    const match = db.prepare(`
      SELECT 
        m.*,
        c1.player1_name as couple1_player1,
        c1.player2_name as couple1_player2,
        c2.player1_name as couple2_player1,
        c2.player2_name as couple2_player2
      FROM matches m
      JOIN couples c1 ON m.couple1_id = c1.id
      JOIN couples c2 ON m.couple2_id = c2.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid)
    
    return match
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Tournament not found') || 
      error.message.includes('couples do not exist') ||
      error.message.includes('Match order already exists') ||
      error.message.includes('cannot play against itself')
    )) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create match'
    })
  }
})
