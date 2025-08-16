# Proderinos - Simplified Betting Module

## Overview
This betting module is designed for admin-managed betting on padel tournament matches. No user groups needed - the admin creates profiles and manages all predictions.

## Database Schema
- `profiles` - Profile profiles (admin-created)
- `match_predictions` - Individual predictions (no group reference)
- Simplified indexes for performance

## API Endpoints

### Profiles Management (Admin Only)
- **GET** `/api/betting/profiles` - List all profiles
- **POST** `/api/betting/profiles` - Create new profile
- **PATCH** `/api/betting/profiles/[profileId]` - Update profile

### Predictions Management (Admin Only)
- **POST** `/api/betting/predictions` - Create single prediction
- **GET** `/api/betting/predictions` - List predictions (filter by profile, match, tournament)
- **PATCH** `/api/betting/predictions/[predictionId]` - Update prediction
- **DELETE** `/api/betting/predictions/[predictionId]` - Delete prediction
- **POST** `/api/betting/predictions/bulk` - Create multiple predictions at once

### Points & Leaderboard
- **POST** `/api/betting/matches/[matchId]/calculate-points` - Calculate points after match completion
- **GET** `/api/betting/leaderboard` - Get profile rankings (filter by tournament)

## Points System
- **3 points** for correct winner prediction
- **+2 bonus points** for exact score prediction (total 5 points)
- **0 points** for incorrect prediction

## Admin Workflow
1. **Create Profiles**: Add betting participants via `/api/betting/profiles`
2. **Create Predictions**: Upload predictions individually or in bulk
3. **Update Match Results**: Use existing tournament endpoints to set winners/scores
4. **Calculate Points**: Call calculate-points endpoint after each completed match
5. **View Leaderboard**: Check rankings anytime

## Key Features
✅ **Simplified**: No profile groups, admin manages everything
✅ **Bulk Operations**: Upload multiple predictions at once
✅ **Automatic Points**: Calculate points when matches complete
✅ **Flexible Filtering**: Filter predictions and leaderboard by tournament
✅ **Validation**: Prevents predictions on started/finished matches
✅ **Upsert Logic**: Can update existing predictions easily

## Example Usage

### Create Profile
```json
POST /api/betting/profiles
{
  "name": "John Doe",
  "email": "john@example.com",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### Create Bulk Predictions
```json
POST /api/betting/predictions/bulk
{
  "profile_id": 1,
  "predictions": [
    {
      "match_id": 1,
      "predicted_winner_id": 5,
      "predicted_score_couple1": 21,
      "predicted_score_couple2": 19
    },
    {
      "match_id": 2,
      "predicted_winner_id": 8
    }
  ]
}
```

### Calculate Points After Match
```json
POST /api/betting/matches/1/calculate-points
// No body needed - automatically calculates based on match results
```

This simplified approach is perfect for your MVP where the admin controls everything!
