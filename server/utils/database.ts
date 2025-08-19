import Database, { type Database as DatabaseType } from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: DatabaseType | null = null

export function getDatabase() {
  if (!db) {
    // Create database in the .data directory (ignored by git)
    const dataDir = join(process.cwd(), '.data')
    const dbPath = join(dataDir, 'proderinos.db')
    
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
  
  // Create users table for authentication with OAuth support
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT DEFAULT 'player' CHECK (role IN ('admin', 'organizator', 'player')),
      name TEXT,
      avatar_url TEXT,
      oauth_provider TEXT,
      oauth_id TEXT,
      is_active BOOLEAN DEFAULT 1,
      profile_completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add new columns if they don't exist (migration)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN oauth_provider TEXT`)
  } catch {
    // Column might already exist
  }
  
  try {
    db.exec(`ALTER TABLE users ADD COLUMN oauth_id TEXT`)
  } catch {
    // Column might already exist
  }
  
  try {
    db.exec(`ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT 0`)
  } catch {
    // Column might already exist
  }

  // Update role constraint to include new roles
  try {
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        role TEXT DEFAULT 'player' CHECK (role IN ('admin', 'organizator', 'player')),
        name TEXT,
        avatar_url TEXT,
        oauth_provider TEXT,
        oauth_id TEXT,
        is_active BOOLEAN DEFAULT 1,
        profile_completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT INTO users_new SELECT 
        id, username, email, password_hash, 
        CASE 
          WHEN role = 'client' THEN 'player'
          ELSE role 
        END as role,
        name, avatar_url, oauth_provider, oauth_id, is_active, profile_completed,
        created_at, updated_at
      FROM users;
      
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
    `)
  } catch {
    // Table might already be updated
    console.log('Users table migration skipped (already updated)')
  }

  // Create tournaments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
      visible BOOLEAN DEFAULT 1,
      primary_color TEXT DEFAULT '#3B82F6',
      background_color TEXT DEFAULT '#F8FAFC',
      owner_id TEXT NOT NULL,
      organizators_id TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add new columns if they don't exist (migration for tournaments)
  try {
    db.exec(`ALTER TABLE tournaments ADD COLUMN visible BOOLEAN DEFAULT 1`)
  } catch {
    // Column might already exist
  }
  
  try {
    db.exec(`ALTER TABLE tournaments ADD COLUMN primary_color TEXT DEFAULT '#3B82F6'`)
  } catch {
    // Column might already exist
  }
  
  try {
    db.exec(`ALTER TABLE tournaments ADD COLUMN background_color TEXT DEFAULT '#F8FAFC'`)
  } catch {
    // Column might already exist
  }
  
  try {
    db.exec(`ALTER TABLE tournaments ADD COLUMN owner_id TEXT`)
  } catch {
    // Column might already exist
  }
  
  try {
    db.exec(`ALTER TABLE tournaments ADD COLUMN organizators_id TEXT DEFAULT '[]'`)
  } catch {
    // Column might already exist
  }
  
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
