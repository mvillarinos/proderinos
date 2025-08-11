import { z } from 'zod'

const schema = z.object({
  predicted_winner_id: z.number().optional(),
  predicted_score_couple1: z.number().optional(),
  predicted_score_couple2: z.number().optional()
})

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const predictionId = getRouterParam(event, 'predictionId')
  
  if (!predictionId || isNaN(Number(predictionId))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid prediction ID'
    })
  }
  
  const body = await readBody(event)
  
  // Validate input
  const validatedData = schema.parse(body)
  
  // Check if there's at least one field to update
  if (!validatedData.predicted_winner_id && 
      validatedData.predicted_score_couple1 === undefined &&
      validatedData.predicted_score_couple2 === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field must be provided for update'
    })
  }
  
  try {
    // Check if prediction exists and get match info
    const prediction = db.prepare(`
      SELECT 
        mp.id, mp.match_id, mp.profile_id,
        m.status, m.couple1_id, m.couple2_id
      FROM match_predictions mp
      JOIN matches m ON mp.match_id = m.id
      WHERE mp.id = ?
    `).get(Number(predictionId)) as {
      id: number;
      match_id: number;
      profile_id: number;
      status: string;
      couple1_id: number;
      couple2_id: number;
    } | undefined
    
    if (!prediction) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Prediction not found'
      })
    }
    
    // Check if match is still open for predictions
    if (prediction.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot update predictions for matches that have started or finished'
      })
    }
    
    // Validate predicted winner if provided
    if (validatedData.predicted_winner_id) {
      if (validatedData.predicted_winner_id !== prediction.couple1_id && 
          validatedData.predicted_winner_id !== prediction.couple2_id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Predicted winner must be one of the match participants'
        })
      }
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const params: unknown[] = []
    
    if (validatedData.predicted_winner_id) {
      updateFields.push('predicted_winner_id = ?')
      params.push(validatedData.predicted_winner_id)
    }
    
    if (validatedData.predicted_score_couple1 !== undefined) {
      updateFields.push('predicted_score_couple1 = ?')
      params.push(validatedData.predicted_score_couple1)
    }
    
    if (validatedData.predicted_score_couple2 !== undefined) {
      updateFields.push('predicted_score_couple2 = ?')
      params.push(validatedData.predicted_score_couple2)
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(Number(predictionId))
    
    const updateQuery = `
      UPDATE match_predictions 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `
    
    db.prepare(updateQuery).run(...params)
    
    // Return updated prediction with details
    const updatedPrediction = db.prepare(`
      SELECT 
        mp.*,
        u.name as profile_name,
        u.avatar_url as profile_avatar,
        c1.player1_name as couple1_player1,
        c1.player2_name as couple1_player2,
        c2.player1_name as couple2_player1,
        c2.player2_name as couple2_player2,
        pw.player1_name as predicted_winner_player1,
        pw.player2_name as predicted_winner_player2
      FROM match_predictions mp
      JOIN profiles u ON mp.profile_id = u.id
      JOIN matches m ON mp.match_id = m.id
      JOIN couples c1 ON m.couple1_id = c1.id
      JOIN couples c2 ON m.couple2_id = c2.id
      JOIN couples pw ON mp.predicted_winner_id = pw.id
      WHERE mp.id = ?
    `).get(Number(predictionId))
    
    return updatedPrediction
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.issues[0]?.message || 'Validation error'
      })
    }
    
    if (error instanceof Error && (
      error.message.includes('Prediction not found') ||
      error.message.includes('Cannot update predictions') ||
      error.message.includes('Predicted winner must')
    )) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update prediction'
    })
  }
})
