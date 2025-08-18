import { z } from 'zod'
import { createUser, getUserByUsername, getUserByEmail } from '../../utils/users'

const signUpSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = signUpSchema.parse(body)

    // Check if username already exists
    const existingUserByUsername = getUserByUsername(validatedData.username)
    if (existingUserByUsername) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username already exists'
      })
    }

    // Check if email already exists
    const existingUserByEmail = getUserByEmail(validatedData.email)
    if (existingUserByEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email already exists'
      })
    }

    // Create new user with default role 'player'
    const newUser = await createUser({
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      role: 'player'
    })

    return {
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.issues
      })
    }
    
    console.error('Failed to create user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create user'
    })
  }
})
