import Database, { type Database as DatabaseType } from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: DatabaseType | null = null

export function getDatabase() {
  if (!db) {
    // Create database in the .data directory (ignored by git)
    const dataDir = join(process.cwd(), '.data')
    const dbPath = join(dataDir, 'villabet.db')
    
    // Ensure .data directory exists
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }
    
    db = new Database(dbPath)
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON')
    
    // Initialize database schema
    initializeSchema()
  }
  
  return db
}

function initializeSchema() {
  if (!db) return
  
  // Create users table for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
      name TEXT,
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create tournaments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Create couples table
  db.exec(`
    CREATE TABLE IF NOT EXISTS couples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      player1_name TEXT NOT NULL,
      player2_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
    )
  `)
  
  // Create matches table
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      couple1_id INTEGER NOT NULL,
      couple2_id INTEGER NOT NULL,
      match_order INTEGER NOT NULL,
      round_name TEXT DEFAULT 'Round 1',
      score_couple1 INTEGER DEFAULT 0,
      score_couple2 INTEGER DEFAULT 0,
      winner_id INTEGER,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
      played_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
      FOREIGN KEY (couple1_id) REFERENCES couples (id) ON DELETE CASCADE,
      FOREIGN KEY (couple2_id) REFERENCES couples (id) ON DELETE CASCADE,
      FOREIGN KEY (winner_id) REFERENCES couples (id)
    )
  `)

  // Create profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      avatar_url TEXT,
      total_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create match predictions table (simplified - no groups)
  db.exec(`
    CREATE TABLE IF NOT EXISTS match_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      predicted_winner_id INTEGER NOT NULL,
      predicted_score_couple1 INTEGER,
      predicted_score_couple2 INTEGER,
      points_earned INTEGER DEFAULT 0,
      is_correct BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
      FOREIGN KEY (predicted_winner_id) REFERENCES couples (id),
      UNIQUE(match_id, profile_id)
    )
  `)
  
  // Create indexes for better performance (simplified)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_couples_tournament_id ON couples (tournament_id);
    CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches (tournament_id);
    CREATE INDEX IF NOT EXISTS idx_matches_couple1_id ON matches (couple1_id);
    CREATE INDEX IF NOT EXISTS idx_matches_couple2_id ON matches (couple2_id);
    CREATE INDEX IF NOT EXISTS idx_match_predictions_match_id ON match_predictions (match_id);
    CREATE INDEX IF NOT EXISTS idx_match_predictions_profile_id ON match_predictions (profile_id);
  `)
}

// Types
export interface Tournament {
  id?: number
  name: string
  description?: string
  start_date?: string
  end_date?: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  created_at?: string
  updated_at?: string
}

export interface Couple {
  id?: number
  tournament_id: number
  player1_name: string
  player2_name: string
  created_at?: string
}

export interface Match {
  id?: number
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

// Authentication Types
export interface User {
  id?: number
  username: string
  email: string
  password_hash?: string
  role: 'admin' | 'client'
  name?: string
  avatar_url?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  role?: 'admin' | 'client'
  name?: string
  avatar_url?: string
}

// Betting Types
export interface Profile {
  id?: number
  name: string
  email?: string
  avatar_url?: string
  total_points?: number
  created_at?: string
  updated_at?: string
}

export interface BettingGroup {
  id?: number
  name: string
  description?: string
  tournament_id: number
  is_public?: boolean
  created_by: number
  created_at?: string
}

export interface BettingGroupMember {
  id?: number
  group_id: number
  profile_id: number
  joined_at?: string
}

export interface MatchPrediction {
  id?: number
  match_id: number
  profile_id: number
  group_id?: number
  predicted_winner_id: number
  predicted_score_couple1?: number
  predicted_score_couple2?: number
  points_earned?: number
  is_correct?: boolean
  created_at?: string
  updated_at?: string
}

export interface MatchPredictionWithDetails extends MatchPrediction {
  profile: {
    id: number
    name: string
    avatar_url?: string
  }
  match: {
    id: number
    couple1: { id: number; player1_name: string; player2_name: string }
    couple2: { id: number; player1_name: string; player2_name: string }
    status: string
    winner_id?: number
  }
  predicted_winner: {
    id: number
    player1_name: string
    player2_name: string
  }
}
