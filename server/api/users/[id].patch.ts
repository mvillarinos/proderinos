import { z } from 'zod'
import { completeUserProfile } from '../../utils/users'
import type { UserPatchBody, UserResponse, ExtendedUser } from '#shared/types'

const completeProfileSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).optional()
})

export default defineEventHandler(async (event): Promise<UserResponse> => {
  // Require authentication
  const session = await requireAuth(event)
  const user = session.user as ExtendedUser
  const userIdParam = getRouterParam(event, 'id')

  if (!userIdParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
    })
  }

  // Only allow users to update their own profile, or allow admin/organizator to update any profile
  const isSelf = String(user.id) === String(userIdParam)
  if (!isSelf && user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have permission to update this user'
    })
  }

  try {
    const body = await readBody(event) as UserPatchBody
    const validatedData = completeProfileSchema.parse(body)

    // Complete the user's profile
    const updatedUser = await completeUserProfile(
      Number(userIdParam),
      validatedData.username,
      validatedData.password
    )

    if (!updatedUser || !updatedUser.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username already taken or user not found'
      })
    }

    // Remove password_hash from response
    const { password_hash, ...userResponse } = updatedUser

    return {
      user: userResponse as UserResponse['user']
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
