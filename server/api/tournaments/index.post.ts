export default defineEventHandler(async (event) => {
  // Require admin authentication for creating tournaments
  await requireAdminAuth(event)
  
  const db = getDatabase()
  const body = await readBody(event) as Omit<Tournament, 'id' | 'created_at' | 'updated_at'>
  
  // Validate required fields
  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tournament name is required'
    })
  }
  
  try {
    const insert = db.prepare(`
      INSERT INTO tournaments (name, description, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const result = insert.run(
      body.name,
      body.description || null,
      body.start_date || null,
      body.end_date || null,
      body.status || 'draft'
    )
    
    // Get the created tournament
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(result.lastInsertRowid)
    
    return tournament
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create tournament'
    })
  }
})
