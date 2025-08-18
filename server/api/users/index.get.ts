import type { UsersResponse } from '#shared/types'

export default defineEventHandler(async (event): Promise<UsersResponse> => {
  // Require admin authentication
  await requireAdminAuth(event)
  
  try {
    const dbUsers = getAllUsers()
    const users = dbUsers.filter(user => user.id !== undefined) as UsersResponse['users']
    return { users }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users'
    })
  }
})
