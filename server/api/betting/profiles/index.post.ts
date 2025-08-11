import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').optional(),
  avatar_url: z.string().url('Valid avatar URL required').optional()
})

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)
  
  // Validate input
  const validatedData = schema.parse(body)
  
  try {
    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingProfile = db.prepare('SELECT id FROM profiles WHERE email = ?').get(validatedData.email)
      if (existingProfile) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Email already exists'
        })
      }
    }
    
    // Create new profile
    const insertProfile = db.prepare(`
      INSERT INTO profiles (name, email, avatar_url)
      VALUES (?, ?, ?)
    `)
    
    const result = insertProfile.run(
      validatedData.name,
      validatedData.email || null,
      validatedData.avatar_url || null
    )
    
    // Return created profile
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid) as Profile
    return profile
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.issues[0]?.message || 'Validation error'
      })
    }
    
    if (error instanceof Error && error.message.includes('Email already exists')) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create profile'
    })
  }
})
