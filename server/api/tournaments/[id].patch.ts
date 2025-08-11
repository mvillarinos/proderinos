export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  const body = await readBody(event) as Partial<Tournament>
  
  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament ID is required'
    })
  }
  
  try {
    // Check if tournament exists
    const existing = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId)
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tournament not found'
      })
    }
    
    // Build update query dynamically for partial updates
    const updates: string[] = []
    const values: (string | null)[] = []
    
    if (body.name !== undefined) {
      updates.push('name = ?')
      values.push(body.name)
    }
    if (body.description !== undefined) {
      updates.push('description = ?')
      values.push(body.description)
    }
    if (body.start_date !== undefined) {
      updates.push('start_date = ?')
      values.push(body.start_date)
    }
    if (body.end_date !== undefined) {
      updates.push('end_date = ?')
      values.push(body.end_date)
    }
    if (body.status !== undefined) {
      updates.push('status = ?')
      values.push(body.status)
    }
    
    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update'
      })
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(tournamentId)
    
    const updateQuery = `UPDATE tournaments SET ${updates.join(', ')} WHERE id = ?`
    db.prepare(updateQuery).run(...values)
    
    // Return updated tournament with all fields
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId)
    return tournament
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Tournament not found') || error.message.includes('No fields to update'))) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update tournament'
    })
  }
})
