export default defineEventHandler(async (_event) => {
  const db = getDatabase()
  
  try {
    const tournaments = db.prepare(`
      SELECT 
        t.*,
        COUNT(c.id) as couples_count,
        COUNT(m.id) as matches_count
      FROM tournaments t
      LEFT JOIN couples c ON t.id = c.tournament_id
      LEFT JOIN matches m ON t.id = m.tournament_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `).all()
    
    return tournaments
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tournaments'
    })
  }
})
