
interface MatchToInsert {
  couple1_id: number
  couple2_id: number
  match_order: number
  round_name: string
}

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  const body = await readBody(event) as {
    format: 'round_robin' | 'knockout'
    rounds?: string[]
  }
  
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
    
    // Get all couples for the tournament
    const couples = db.prepare('SELECT id FROM couples WHERE tournament_id = ? ORDER BY id').all(tournamentId) as Array<{ id: number }>
    
    if (couples.length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least 2 couples are required to generate matches'
      })
    }
    
    // Check if matches already exist
    const existingMatches = db.prepare('SELECT COUNT(*) as count FROM matches WHERE tournament_id = ?').get(tournamentId) as { count: number }
    if (existingMatches.count > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Matches already exist for this tournament'
      })
    }
    
    const matches: MatchToInsert[] = []
    
    if (body.format === 'round_robin') {
      // Generate round-robin matches (every couple plays every other couple once)
      let matchOrder = 1
      for (let i = 0; i < couples.length; i++) {
        for (let j = i + 1; j < couples.length; j++) {
          const couple1 = couples[i]
          const couple2 = couples[j]
          if (couple1?.id && couple2?.id) {
            matches.push({
              couple1_id: couple1.id,
              couple2_id: couple2.id,
              match_order: matchOrder,
              round_name: 'Round Robin'
            })
            matchOrder++
          }
        }
      }
    } else if (body.format === 'knockout') {
      // Generate knockout tournament
      // For simplicity, we'll create first round matches
      // You can extend this logic for multiple rounds
      let matchOrder = 1
      const roundName = body.rounds?.[0] || 'First Round'
      
      for (let i = 0; i < couples.length; i += 2) {
        if (i + 1 < couples.length) {
          const couple1 = couples[i]
          const couple2 = couples[i + 1]
          if (couple1?.id && couple2?.id) {
            matches.push({
              couple1_id: couple1.id,
              couple2_id: couple2.id,
              match_order: matchOrder,
              round_name: roundName
            })
            matchOrder++
          }
        }
      }
    }
    
    // Insert all matches
    const insertMatch = db.prepare(`
      INSERT INTO matches (tournament_id, couple1_id, couple2_id, match_order, round_name, score_couple1, score_couple2, status)
      VALUES (?, ?, ?, ?, ?, 0, 0, 'pending')
    `)
    
    const insertTransaction = db.transaction((matchesToInsert: MatchToInsert[]) => {
      for (const match of matchesToInsert) {
        insertMatch.run(tournamentId, match.couple1_id, match.couple2_id, match.match_order, match.round_name)
      }
    })
    
    insertTransaction(matches)
    
    return {
      success: true,
      message: `Generated ${matches.length} matches for ${body.format} tournament`,
      matches_created: matches.length
    }
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Tournament not found') || 
      error.message.includes('At least 2 couples') ||
      error.message.includes('Matches already exist')
    )) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate matches'
    })
  }
})
