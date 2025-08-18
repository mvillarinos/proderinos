import { canManageTournament } from '../../../../utils/auth-check'
import { getDatabase, type Couple } from '../../../../utils/database'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  const body = await readBody(event) as Omit<Couple, 'id' | 'tournament_id' | 'created_at'>
  
  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament ID is required'
    })
  }
  
  // Check permissions to manage this tournament
  await canManageTournament(event, tournamentId)
  
  // Validate required fields
  if (!body.player1_name || !body.player2_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both player names are required'
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
    
    // Check for duplicate couple in the same tournament
    const existingCouple = db.prepare(`
      SELECT id FROM couples 
      WHERE tournament_id = ? 
      AND ((player1_name = ? AND player2_name = ?) OR (player1_name = ? AND player2_name = ?))
    `).get(tournamentId, body.player1_name, body.player2_name, body.player2_name, body.player1_name)
    
    if (existingCouple) {
      throw createError({
        statusCode: 409,
        statusMessage: 'This couple already exists in the tournament'
      })
    }
    
    const insert = db.prepare(`
      INSERT INTO couples (tournament_id, player1_name, player2_name)
      VALUES (?, ?, ?)
    `)
    
    const result = insert.run(tournamentId, body.player1_name, body.player2_name)
    
    // Get the created couple
    const couple = db.prepare('SELECT * FROM couples WHERE id = ?').get(result.lastInsertRowid)
    
    return couple
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Tournament not found') || error.message.includes('couple already exists'))) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create couple'
    })
  }
})
