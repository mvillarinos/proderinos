import { z } from 'zod'
import { completeUserProfile } from '../../../utils/users'

const completeProfileSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).optional()
})

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string
  role?: 'admin' | 'organizator' | 'player'
  dbId?: string | number
  profileCompleted?: boolean
}

export default defineEventHandler(async (event) => {
  // Require authentication but not admin
  const session = await requireAuth(event)
  const user = session.user as ExtendedUser
  
  if (!user.dbId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User not found in database'
    })
  }
  
  try {
    const body = await readBody(event)
    const validatedData = completeProfileSchema.parse(body)
    
    // Complete the user's profile
    const updatedUser = await completeUserProfile(
      Number(user.dbId),
      validatedData.username,
      validatedData.password
    )
    
    if (!updatedUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username already taken or user not found'
      })
    }
    
    return { 
      success: true, 
      user: updatedUser 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.issues
      })
    }
    
    console.error('Failed to complete profile:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to complete profile'
    })
  }
})
