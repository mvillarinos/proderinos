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
    
    // Cannot remove the owner
    if (tournament.owner_id === body.organizatorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot remove tournament owner'
      })
    }
    
    // Parse current organizators
    const currentOrganizators = tournament.organizators_id ? JSON.parse(tournament.organizators_id) : []
    
    // Check if user is actually an organizator
    if (!currentOrganizators.includes(body.organizatorId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is not an organizator of this tournament'
      })
    }
    
    // Remove organizator
    const updatedOrganizators = currentOrganizators.filter((id: string) => id !== body.organizatorId)
    
    // Update tournament
    db.prepare(`
      UPDATE tournaments 
      SET organizators_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(JSON.stringify(updatedOrganizators), tournamentId)
    
    return {
      success: true,
      message: 'Organizator removed successfully',
      organizators_id: updatedOrganizators
    }
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Tournament not found') ||
      error.message.includes('Cannot remove tournament owner') ||
      error.message.includes('not an organizator')
    )) {
      throw error
    }
    console.error('Remove organizator error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove organizator'
    })
  }
})
