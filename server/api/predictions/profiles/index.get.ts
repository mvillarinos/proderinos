export default defineEventHandler(async (_event) => {
  const db = getDatabase()
  
  try {
    const profiles = db.prepare(`
      SELECT 
        id,
        name,
        email,
        avatar_url,
        total_points,
        created_at
      FROM profiles 
      ORDER BY total_points DESC, name ASC
    `).all()
    
    return profiles
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch profiles'
    })
  }
})
