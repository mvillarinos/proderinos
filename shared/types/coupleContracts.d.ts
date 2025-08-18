// Base Couple Type
export interface Couple {
  id: number
  tournament_id: number
  player1_name: string
  player2_name: string
  created_at?: string
}

// Couple API Request Bodies
export interface CouplePostBody {
  player1_name: string
  player2_name: string
}

// Couple API Responses
export interface CoupleResponse {
  couple: Couple
}

export interface CouplesResponse {
  couples: Couple[]
}
