// Auth signup body
export interface AuthSignupBody {
  username: string
  email: string
  password: string
  name?: string
}

// Auth signup response
export interface AuthSignupResponse {
  user: {
    id: number
    username: string
    email: string
    name?: string
    role: 'admin' | 'organizator' | 'player'
    profile_completed: boolean
  }
  message: string
}

// Standard API Error Response
export interface ApiError {
  statusCode: number
  statusMessage: string
  data?: unknown
}

// Standard Success Response
export interface ApiSuccess {
  success: boolean
  message: string
}
