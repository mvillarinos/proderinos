import bcrypt from 'bcryptjs'
import { getDatabase, type User, type CreateUserData } from './database'

const db = getDatabase()

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function getUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
  const result = stmt.get(username)
  return result ? result as User : undefined
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  const result = stmt.get(email)
  return result ? result as User : undefined
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  const result = stmt.get(id)
  return result ? result as User : undefined
}

export async function createUser(userData: CreateUserData): Promise<User> {
  let passwordHash: string | null = null
  
  // Only hash password if provided (for OAuth users, password might be null)
  if (userData.password) {
    passwordHash = await hashPassword(userData.password)
  }
  
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, role, name, avatar_url, oauth_provider, oauth_id, profile_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  const result = stmt.run(
    userData.username || null,
    userData.email,
    passwordHash,
    userData.role || 'player',
    userData.name || null,
    userData.avatar_url || null,
    userData.oauth_provider || null,
    userData.oauth_id || null,
    userData.password ? 1 : 0 // Profile is completed if password is set
  )
  
  const newUser = getUserById(result.lastInsertRowid as number)
  if (!newUser) {
    throw new Error('Failed to create user')
  }
  
  // Remove password_hash from return value
  const { password_hash, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = getUserByUsername(username)
  if (!user || !user.password_hash || !user.is_active) {
    return null
  }
  
  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return null
  }
  
  // Remove password_hash from return value
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}

export function getAllUsers(): Omit<User, 'password_hash'>[] {
  const stmt = db.prepare('SELECT id, username, email, role, name, avatar_url, oauth_provider, oauth_id, is_active, profile_completed, created_at, updated_at FROM users ORDER BY created_at DESC')
  const result = stmt.all()
  return result as Omit<User, 'password_hash'>[]
}

export function getUsersCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users')
  const result = stmt.get()
  return result ? (result as { count: number }).count : 0
}

export function updateUserRole(userId: number, role: 'admin' | 'organizator' | 'player'): boolean {
  const stmt = db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
  const result = stmt.run(role, userId)
  return result.changes > 0
}

export function deactivateUser(userId: number): boolean {
  const stmt = db.prepare('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
  const result = stmt.run(userId)
  return result.changes > 0
}

export function reactivateUser(userId: number): boolean {
  const stmt = db.prepare('UPDATE users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
  const result = stmt.run(userId)
  return result.changes > 0
}

// OAuth and profile management functions
export function findOrCreateOAuthUser(email: string, name: string, avatarUrl?: string, provider?: string, oauthId?: string): User {
  // First, try to find existing user by email
  let user = getUserByEmail(email)
  
  if (!user) {
    // Create new OAuth user
    const stmt = db.prepare(`
      INSERT INTO users (email, name, avatar_url, oauth_provider, oauth_id, role, profile_completed)
      VALUES (?, ?, ?, ?, ?, 'player', 0)
    `)
    
    const result = stmt.run(email, name, avatarUrl || null, provider || null, oauthId || null)
    user = getUserById(result.lastInsertRowid as number)
  } else if (!user.oauth_provider && provider) {
    // Update existing user with OAuth info
    const stmt = db.prepare(`
      UPDATE users SET 
        oauth_provider = ?, 
        oauth_id = ?, 
        avatar_url = COALESCE(?, avatar_url),
        name = COALESCE(?, name),
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    stmt.run(provider, oauthId || null, avatarUrl || null, name, user.id)
    user = getUserById(user.id!)
  }
  
  if (!user) {
    throw new Error('Failed to create or update OAuth user')
  }
  
  // Remove password_hash from return value
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function completeUserProfile(userId: number, username: string, password?: string): Promise<User | null> {
  // Check if username is already taken
  const existingUser = getUserByUsername(username)
  if (existingUser && existingUser.id !== userId) {
    return null // Username taken
  }
  
  let passwordHash: string | null = null
  if (password) {
    passwordHash = await hashPassword(password)
  }
  
  const stmt = db.prepare(`
    UPDATE users SET 
      username = ?, 
      password_hash = COALESCE(?, password_hash),
      profile_completed = 1,
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `)
  
  const result = stmt.run(username, passwordHash, userId)
  if (result.changes === 0) {
    return null
  }
  
  const updatedUser = getUserById(userId)
  if (!updatedUser) {
    return null
  }
  
  // Remove password_hash from return value
  const { password_hash, ...userWithoutPassword } = updatedUser
  return userWithoutPassword
}

export function isAdminEmail(email: string): boolean {
  const runtimeConfig = useRuntimeConfig()
  return email === runtimeConfig.adminEmail
}
