import { z } from 'zod'

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'client']).optional(),
  name: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
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
    
    return { user: newUser }
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
