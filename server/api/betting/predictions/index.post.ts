import { z } from 'zod'

const schema = z.object({
  match_id: z.number(),
  profile_id: z.number(),
  predicted_winner_id: z.number(),
  predicted_score_couple1: z.number().optional(),
  predicted_score_couple2: z.number().optional()
})

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)
  
  // Validate input
  const validatedData = schema.parse(body)
  
  try {
    // Check if match exists and is not completed
    const match = db.prepare(`
      SELECT id, status, couple1_id, couple2_id, tournament_id
      FROM matches 
      WHERE id = ?
    `).get(validatedData.match_id) as { 
      id: number; 
      status: string; 
      couple1_id: number; 
      couple2_id: number; 
      tournament_id: number 
    } | undefined
    
    if (!match) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Match not found'
      })
    }
    
    if (match.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot predict on matches that have started or finished'
      })
    }
    
    // Validate predicted winner is one of the couples in the match
    if (validatedData.predicted_winner_id !== match.couple1_id && 
        validatedData.predicted_winner_id !== match.couple2_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Predicted winner must be one of the match participants'
      })
    }
    
    // Check if profile exists
    const profile = db.prepare('SELECT id FROM profiles WHERE id = ?').get(validatedData.profile_id)
    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Profile not found'
      })
    }

    // Create or update prediction (upsert)
    const upsertPrediction = db.prepare(`
      INSERT OR REPLACE INTO match_predictions 
      (match_id, profile_id, predicted_winner_id, predicted_score_couple1, predicted_score_couple2)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = upsertPrediction.run(
      validatedData.match_id,
      validatedData.profile_id,
      validatedData.predicted_winner_id,
      validatedData.predicted_score_couple1 || null,
      validatedData.predicted_score_couple2 || null
    )
    
    // Return prediction with details
    const prediction = db.prepare(`
      SELECT 
        mp.*,
        p.name as profile_name,
        p.avatar_url as profile_avatar,
        c1.player1_name as couple1_player1,
        c1.player2_name as couple1_player2,
        c2.player1_name as couple2_player1,
        c2.player2_name as couple2_player2,
        pw.player1_name as predicted_winner_player1,
        pw.player2_name as predicted_winner_player2
      FROM match_predictions mp
      JOIN profiles p ON mp.profile_id = p.id
      JOIN matches m ON mp.match_id = m.id
      JOIN couples c1 ON m.couple1_id = c1.id
      JOIN couples c2 ON m.couple2_id = c2.id
      JOIN couples pw ON mp.predicted_winner_id = pw.id
      WHERE mp.id = ? OR mp.rowid = ?
    `).get(result.lastInsertRowid, result.lastInsertRowid)
    
    return prediction
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.issues[0]?.message || 'Validation error'
      })
    }
    
    if (error instanceof Error && (
      error.message.includes('Match not found') ||
      error.message.includes('Cannot predict') ||
      error.message.includes('Predicted winner must') ||
      error.message.includes('Profile not found')
    )) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create prediction'
    })
  }
})
