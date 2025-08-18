// Base Match Type
export interface Match {
  id: number
  tournament_id: number
  couple1_id: number
  couple2_id: number
  match_order: number
  round_name?: string
  score_couple1: number
  score_couple2: number
  winner_id?: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  played_at?: string
  created_at?: string
}

// Extended Match with Couple Details
export interface MatchWithCouples extends Match {
  couple1: {
    id: number
    player1_name: string
    player2_name: string
  }
  couple2: {
    id: number
    player1_name: string
    player2_name: string
  }
}

// Match API Request Bodies
export interface MatchPostBody {
  couple1_id: number
  couple2_id: number
  match_order: number
  round_name?: string
}

export interface MatchResultBody {
  score_couple1: number
  score_couple2: number
  winner_id?: number
  status?: 'completed' | 'cancelled'
  played_at?: string
}

// Match API Responses
export interface MatchResponse {
  match: Match
}

export interface MatchesResponse {
  matches: MatchWithCouples[]
}

export interface MatchGenerateResponse {
  matches: Match[]
  message: string
}

export interface MatchPointsResponse {
  success: boolean
  message: string
  points_awarded: number
}
