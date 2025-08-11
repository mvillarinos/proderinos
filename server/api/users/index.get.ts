export default defineEventHandler(async (_event) => {
  // For now, we'll create a simple endpoint
  // TODO: Add proper auth middleware after testing
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
