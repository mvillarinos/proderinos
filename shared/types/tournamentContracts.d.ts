// Base Tournament Type
export interface Tournament {
  id: number
  name: string
  description?: string
  start_date?: string
  end_date?: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  visible?: boolean
  primary_color?: string
  background_color?: string
  owner_id: string
  organizators_id?: string[] | string
  created_at?: string
  updated_at?: string
}

// Tournament with additional data for listings
export interface TournamentWithCounts extends Tournament {
  couples_count: number
  matches_count: number
}

// Tournament API Request Bodies
export interface TournamentPostBody {
  name: string
  description?: string
  start_date?: string
  end_date?: string
  status?: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  visible?: boolean
  primary_color?: string
  background_color?: string
  organizators_id?: string[]
}

export interface TournamentPatchBody {
  name?: string
  description?: string
  start_date?: string
  end_date?: string
  status?: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  visible?: boolean
  primary_color?: string
  background_color?: string
  organizators_id?: string[]
}

// Tournament API Responses
export interface TournamentResponse {
  tournament: Tournament
}

export interface TournamentsResponse {
  tournaments: TournamentWithCounts[]
}

export interface TournamentStatsResponse {
  tournament: Tournament
  stats: {
    total_couples: number
    total_matches: number
    completed_matches: number
    pending_matches: number
  }
}

// Tournament Organization
export interface TournamentOrganizatorBody {
  organizatorId: string
}
