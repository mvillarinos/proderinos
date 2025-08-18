import { z } from 'zod'
import { updateUserRole } from '../../../utils/users'

const updateRoleSchema = z.object({
  userId: z.number(),
  role: z.enum(['admin', 'organizator', 'player'])
})

export default defineEventHandler(async (event) => {
  // Require admin authentication
  await requireAdminAuth(event)
  
  try {
    const body = await readBody(event)
    const validatedData = updateRoleSchema.parse(body)
    
    const success = updateUserRole(validatedData.userId, validatedData.role)
    
    if (!success) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return { 
      success: true,
      message: 'User role updated successfully'
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.issues
      })
    }
    
    console.error('Failed to update user role:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user role'
    })
  }
})
