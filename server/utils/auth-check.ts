import type { H3Event } from 'h3'

// Simple auth utility for API routes
export function checkAdminAuth(event: H3Event): boolean {
  const authHeader = getHeader(event, 'authorization')
  // For now, just check if there's a valid admin session
  // In production, you'd verify JWT tokens here
  return !!authHeader && authHeader.includes('admin')
}

export function requireAdminAuth(event: H3Event): void {
  if (!checkAdminAuth(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Admin authentication required'
    })
  }
}
