// Base Prediction Type
export interface MatchPrediction {
  id: number
  match_id: number
  profile_id: number
  predicted_score_couple1: number
  predicted_score_couple2: number
  predicted_winner_id?: number
  points_earned?: number
  created_at?: string
  updated_at?: string
}

// Extended Prediction with Details
export interface MatchPredictionWithDetails extends MatchPrediction {
  match: {
    id: number
    tournament_id: number
    couple1_id: number
    couple2_id: number
    match_order: number
    round_name?: string
    score_couple1: number
    score_couple2: number
    winner_id?: number
    status: string
    played_at?: string
  }
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

// Prediction API Request Bodies
export interface PredictionPostBody {
  match_id: number
  predicted_score_couple1: number
  predicted_score_couple2: number
  predicted_winner_id?: number
}

export interface PredictionPatchBody {
  predicted_score_couple1?: number
  predicted_score_couple2?: number
  predicted_winner_id?: number
}

// Prediction API Responses
export interface PredictionResponse {
  prediction: MatchPrediction
}

export interface PredictionsResponse {
  predictions: MatchPredictionWithDetails[]
}

export interface PredictionDeleteResponse {
  success: boolean
  message: string
}

// Profile for predictions
export interface Profile {
  id: number
  name: string
  user_id?: number
  created_at?: string
}
