// Base User Type
export interface User {
  id: number
  username?: string
  email: string
  password_hash?: string
  role: 'admin' | 'organizator' | 'player'
  name?: string
  avatar_url?: string
  oauth_provider?: string
  oauth_id?: string
  is_active?: boolean
  profile_completed?: boolean
  created_at?: string
  updated_at?: string
}

// User API Request Bodies
export interface UserPostBody {
  username: string
  email: string
  password: string
  role?: 'admin' | 'organizator' | 'player'
  name?: string
}

export interface UserPatchBody {
  username?: string
  password?: string
}

export interface UserRolePatchBody {
  userId: number
  role: 'admin' | 'organizator' | 'player'
}

// User API Responses
export interface UserResponse {
  user: Omit<User, 'password_hash'>
}

export interface UsersResponse {
  users: Omit<User, 'password_hash'>[]
}

export interface UserRoleUpdateResponse {
  success: boolean
  message: string
}

// Extended User for Auth Sessions
export interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string
  role?: 'admin' | 'organizator' | 'player'
  dbId?: string | number
  profileCompleted?: boolean
}
