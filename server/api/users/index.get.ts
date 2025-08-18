export default defineEventHandler(async (event) => {
  // Require admin authentication
  await requireAdminAuth(event)
  
  try {
    const users = getAllUsers()
    return { users }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users'
    })
  }
})
