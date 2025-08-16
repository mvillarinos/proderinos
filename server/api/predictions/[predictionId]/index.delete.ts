export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const predictionId = getRouterParam(event, 'predictionId')
  
  if (!predictionId || isNaN(Number(predictionId))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid prediction ID'
    })
  }
  
  try {
    // Check if prediction exists and get match info to verify deletion is allowed
    const prediction = db.prepare(`
      SELECT 
        mp.id, mp.match_id, mp.profile_id,
        m.status
      FROM match_predictions mp
      JOIN matches m ON mp.match_id = m.id
      WHERE mp.id = ?
    `).get(Number(predictionId)) as {
      id: number;
      match_id: number;
      profile_id: number;
      status: string;
    } | undefined
    
    if (!prediction) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Prediction not found'
      })
    }
    
    // Check if match is still open for prediction changes
    if (prediction.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete predictions for matches that have started or finished'
      })
    }
    
    // Delete the prediction
    const result = db.prepare('DELETE FROM match_predictions WHERE id = ?')
      .run(Number(predictionId))
    
    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Prediction not found'
      })
    }
    
    return { 
      success: true, 
      message: 'Prediction deleted successfully' 
    }
    
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Prediction not found') ||
      error.message.includes('Cannot delete predictions')
    )) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete prediction'
    })
  }
})
