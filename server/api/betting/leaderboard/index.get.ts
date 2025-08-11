export default defineEventHandler(async (event) => {
  const db = getDatabase()
  
  try {
    const query = getQuery(event)
    const tournamentId = query.tournament_id ? Number(query.tournament_id) : undefined
    const limit = query.limit ? Math.min(Number(query.limit), 100) : 50
    
    let sqlQuery = `
      SELECT 
        u.id as profile_id,
        u.name as profile_name,
        u.avatar_url as profile_avatar,
        COALESCE(SUM(mp.points_earned), 0) as total_points,
        COUNT(mp.id) as total_predictions,
        COUNT(CASE WHEN mp.points_earned > 0 THEN 1 END) as correct_predictions,
        CASE 
          WHEN COUNT(mp.id) > 0 
          THEN ROUND((COUNT(CASE WHEN mp.points_earned > 0 THEN 1 END) * 100.0) / COUNT(mp.id), 2)
          ELSE 0
        END as accuracy_percentage
      FROM profiles u
      LEFT JOIN match_predictions mp ON u.id = mp.profile_id
    `
    
    const conditions: string[] = []
    const params: unknown[] = []
    
    if (tournamentId) {
      sqlQuery += ' LEFT JOIN matches m ON mp.match_id = m.id'
      conditions.push('m.tournament_id = ?')
      params.push(tournamentId)
    }
    
    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ')
    }
    
    sqlQuery += `
      GROUP BY u.id, u.name, u.avatar_url
      ORDER BY total_points DESC, accuracy_percentage DESC
      LIMIT ?
    `
    
    params.push(limit)
    
    const leaderboard = db.prepare(sqlQuery).all(...params) as Array<{
      profile_id: number;
      profile_name: string;
      profile_avatar: string | null;
      total_points: number;
      total_predictions: number;
      correct_predictions: number;
      accuracy_percentage: number;
    }>
    
    // Add ranking
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }))
    
    return {
      leaderboard: rankedLeaderboard,
      total_profiles: rankedLeaderboard.length
    }
    
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leaderboard'
    })
  }
})
