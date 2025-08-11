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
  return stmt.get(username) as User | undefined
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email) as User | undefined
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  return stmt.get(id) as User | undefined
}

export async function createUser(userData: CreateUserData): Promise<User> {
  const passwordHash = await hashPassword(userData.password)
  
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, role, name, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  const result = stmt.run(
    userData.username,
    userData.email,
    passwordHash,
    userData.role || 'client',
    userData.name || null,
    userData.avatar_url || null
  )
  
  const newUser = getUserById(result.lastInsertRowid as number)
  if (!newUser) {
    throw new Error('Failed to create user')
  }
  
  // Remove password_hash from return value
  const { password_hash, ...userWithoutPassword } = newUser
  return userWithoutPassword as User
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
  return userWithoutPassword as User
}

export function getAllUsers(): Omit<User, 'password_hash'>[] {
  const stmt = db.prepare('SELECT id, username, email, role, name, avatar_url, is_active, created_at, updated_at FROM users ORDER BY created_at DESC')
  return stmt.all() as Omit<User, 'password_hash'>[]
}

export function getUsersCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users')
  const result = stmt.get() as { count: number }
  return result.count
}

export function updateUserRole(userId: number, role: 'admin' | 'client'): boolean {
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
