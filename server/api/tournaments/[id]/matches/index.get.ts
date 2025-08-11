interface MatchRow {
  id: number
  tournament_id: number
  couple1_id: number
  couple2_id: number
  match_order: number
  round_name: string
  score_couple1: number
  score_couple2: number
  winner_id: number | null
  status: string
  played_at: string | null
  created_at: string
  couple1_player1: string
  couple1_player2: string
  couple2_player1: string
  couple2_player2: string
  winner_player1: string | null
  winner_player2: string | null
}

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
    
    const matches = db.prepare(`
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
      WHERE m.tournament_id = ?
      ORDER BY m.match_order ASC
    `).all(tournamentId) as MatchRow[]
    
    // Transform the result to include nested couple objects
    const formattedMatches = matches.map((match: MatchRow) => ({
      id: match.id,
      tournament_id: match.tournament_id,
      couple1_id: match.couple1_id,
      couple2_id: match.couple2_id,
      match_order: match.match_order,
      round_name: match.round_name,
      score_couple1: match.score_couple1,
      score_couple2: match.score_couple2,
      winner_id: match.winner_id,
      status: match.status,
      played_at: match.played_at,
      created_at: match.created_at,
      couple1: {
        id: match.couple1_id,
        player1_name: match.couple1_player1,
        player2_name: match.couple1_player2
      },
      couple2: {
        id: match.couple2_id,
        player1_name: match.couple2_player1,
        player2_name: match.couple2_player2
      },
      winner: match.winner_id ? {
        id: match.winner_id,
        player1_name: match.winner_player1,
        player2_name: match.winner_player2
      } : null
    }))
    
    return formattedMatches
  } catch (error) {
    if (error instanceof Error && error.message.includes('Tournament not found')) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch matches'
    })
  }
})
