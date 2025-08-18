import { canManageTournament } from '../../../utils/auth-check'
import { getDatabase } from '../../../utils/database'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const tournamentId = getRouterParam(event, 'id')
  const body = await readBody(event) as { organizatorId: string }
  
  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament ID is required'
    })
  }
  
  if (!body.organizatorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organizator ID is required'
    })
  }
  
  // Check permissions to manage this tournament
  await canManageTournament(event, tournamentId)
  
  try {
    // Check if tournament exists
    const tournament = db.prepare('SELECT owner_id, organizators_id FROM tournaments WHERE id = ?').get(tournamentId) as { owner_id: string, organizators_id: string } | undefined
    if (!tournament) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tournament not found'
      })
    }
    
    // Check if user exists and is an organizator
    const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(body.organizatorId) as { id: number, role: string } | undefined
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    if (user.role !== 'organizator' && user.role !== 'admin') {
      throw createError({
        statusCode: 400,
        statusMessage: 'User must be an organizator or admin'
      })
    }
    
    // Parse current organizators
    const currentOrganizators = tournament.organizators_id ? JSON.parse(tournament.organizators_id) : []
    
    // Check if user is already an organizator or owner
    if (tournament.owner_id === body.organizatorId || currentOrganizators.includes(body.organizatorId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is already an organizator of this tournament'
      })
    }
    
    // Add new organizator
    const updatedOrganizators = [...currentOrganizators, body.organizatorId]
    
    // Update tournament
    db.prepare(`
      UPDATE tournaments 
      SET organizators_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(JSON.stringify(updatedOrganizators), tournamentId)
    
    return {
      success: true,
      message: 'Organizator added successfully',
      organizators_id: updatedOrganizators
    }
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Tournament not found') ||
      error.message.includes('User not found') ||
      error.message.includes('User must be an organizator') ||
      error.message.includes('already an organizator')
    )) {
      throw error
    }
    console.error('Add organizator error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add organizator'
    })
  }
})
