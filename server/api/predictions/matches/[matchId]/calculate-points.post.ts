/**
 * Calculate points for predictions when a match is completed
 * Call this endpoint after updating match results
 */
export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const matchId = getRouterParam(event, 'matchId')
  
  if (!matchId || isNaN(Number(matchId))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid match ID'
    })
  }
  
  try {
    // Get match details
    const match = db.prepare(`
      SELECT id, winner_id, score_couple1, score_couple2, status
      FROM matches 
      WHERE id = ?
    `).get(Number(matchId)) as {
      id: number;
      winner_id: number;
      score_couple1: number;
      score_couple2: number;
      status: string;
    } | undefined
    
    if (!match) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Match not found'
      })
    }
    
    if (match.status !== 'completed') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Match must be completed to calculate points'
      })
    }
    
    if (!match.winner_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Match must have a winner to calculate points'
      })
    }
    
    // Get all predictions for this match
    const predictions = db.prepare(`
      SELECT id, profile_id, predicted_winner_id, predicted_score_couple1, predicted_score_couple2
      FROM match_predictions
      WHERE match_id = ?
    `).all(Number(matchId)) as Array<{
      id: number;
      profile_id: number;
      predicted_winner_id: number;
      predicted_score_couple1: number | null;
      predicted_score_couple2: number | null;
    }>
    
    if (predictions.length === 0) {
      return {
        message: 'No predictions found for this match',
        updated_predictions: 0
      }
    }
    
    // Calculate points for each prediction
    const updatePrediction = db.prepare(`
      UPDATE match_predictions 
      SET points_earned = ?, is_correct = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const updateProfilePoints = db.prepare(`
      UPDATE profiles 
      SET total_points = (
        SELECT COALESCE(SUM(points_earned), 0) 
        FROM match_predictions 
        WHERE profile_id = ?
      )
      WHERE id = ?
    `)
    
    const transaction = db.transaction(() => {
      let updatedCount = 0
      
      for (const prediction of predictions) {
        let points = 0
        let isCorrect = false
        
        // Points for correct winner prediction
        if (prediction.predicted_winner_id === match.winner_id) {
          points += 3 // Base points for correct winner
          isCorrect = true
          
          // Bonus points for exact score prediction
          if (prediction.predicted_score_couple1 === match.score_couple1 && 
              prediction.predicted_score_couple2 === match.score_couple2) {
            points += 2 // Bonus for exact score
          }
        }
        
        // Update prediction
        updatePrediction.run(points, isCorrect ? 1 : 0, prediction.id)
        
        // Update profile's total points
        updateProfilePoints.run(prediction.profile_id, prediction.profile_id)
        
        updatedCount++
      }
      
      return updatedCount
    })
    
    const updatedCount = transaction()
    
    return {
      message: `Points calculated for ${updatedCount} predictions`,
      updated_predictions: updatedCount,
      match_id: Number(matchId)
    }
    
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Match not found') ||
      error.message.includes('Match must be completed') ||
      error.message.includes('Match must have a winner')
    )) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to calculate points'
    })
  }
})
