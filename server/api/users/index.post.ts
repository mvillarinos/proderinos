import { z } from 'zod'
import type { UserPostBody, UserResponse } from '#shared/types'

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'organizator', 'player']).optional(),
  name: z.string().optional()
})

export default defineEventHandler(async (event): Promise<UserResponse> => {
  // Require admin authentication for creating users
  await requireAdminAuth(event)
  
  try {
    const body = await readBody(event) as UserPostBody
    const validatedData = createUserSchema.parse(body)

    // Check if username already exists
    const existingUser = getUserByUsername(validatedData.username)
    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username already exists'
      })
    }

    // Check if email already exists
    const existingEmail = getUserByEmail(validatedData.email)
    if (existingEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email already exists'
      })
    }

    // Create new user
    const newUser = await createUser(validatedData)
    
    if (!newUser || !newUser.id) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create user'
      })
    }
    
    // Remove password_hash from response
    const { password_hash, ...userResponse } = newUser
    
    return { user: userResponse as UserResponse['user'] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.issues[0]?.message || 'Validation error'
      })
    }
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    console.error('Failed to create user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create user'
    })
  }
})
