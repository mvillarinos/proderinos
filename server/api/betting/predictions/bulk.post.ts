import { z } from 'zod'

const bulkPredictionSchema = z.object({
  profile_id: z.number(),
  predictions: z.array(z.object({
    match_id: z.number(),
    predicted_winner_id: z.number(),
    predicted_score_couple1: z.number().optional(),
    predicted_score_couple2: z.number().optional()
  })).min(1, 'At least one prediction is required')
})

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)
  
  // Validate input
  const validatedData = bulkPredictionSchema.parse(body)
  
  try {
    // Check if profile exists
    const profile = db.prepare('SELECT id FROM profiles WHERE id = ?').get(validatedData.profile_id)
    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Profile not found'
      })
    }
    
    // Validate all matches exist and are pending
    const matchIds = validatedData.predictions.map(p => p.match_id)
    const matches = db.prepare(`
      SELECT id, status, couple1_id, couple2_id
      FROM matches 
      WHERE id IN (${matchIds.map(() => '?').join(',')})
    `).all(...matchIds) as Array<{
      id: number;
      status: string;
      couple1_id: number;
      couple2_id: number;
    }>
    
    if (matches.length !== matchIds.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'One or more matches not found'
      })
    }
    
    // Check all matches are pending
    const nonPendingMatches = matches.filter(m => m.status !== 'pending')
    if (nonPendingMatches.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot predict on matches that have started or finished: ${nonPendingMatches.map(m => m.id).join(', ')}`
      })
    }
    
    // Validate predicted winners
    for (const prediction of validatedData.predictions) {
      const match = matches.find(m => m.id === prediction.match_id)
      if (match && 
          prediction.predicted_winner_id !== match.couple1_id && 
          prediction.predicted_winner_id !== match.couple2_id) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid predicted winner for match ${prediction.match_id}`
        })
      }
    }
    
    // Begin transaction
    const insertPrediction = db.prepare(`
      INSERT OR REPLACE INTO match_predictions 
      (match_id, profile_id, predicted_winner_id, predicted_score_couple1, predicted_score_couple2)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const transaction = db.transaction((predictions: typeof validatedData.predictions) => {
      const results = []
      for (const prediction of predictions) {
        const result = insertPrediction.run(
          prediction.match_id,
          validatedData.profile_id,
          prediction.predicted_winner_id,
          prediction.predicted_score_couple1 || null,
          prediction.predicted_score_couple2 || null
        )
        results.push(result)
      }
      return results
    })
    
    const results = transaction(validatedData.predictions)
    
    return {
      success: true,
      message: `${results.length} predictions saved successfully`,
      predictions_count: results.length
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.issues[0]?.message || 'Validation error'
      })
    }
    
    if (error instanceof Error && (
      error.message.includes('Profile not found') ||
      error.message.includes('One or more matches not found') ||
      error.message.includes('Cannot predict on matches') ||
      error.message.includes('Invalid predicted winner')
    )) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save bulk predictions'
    })
  }
})
