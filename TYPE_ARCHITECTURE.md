# Type-Safe API Architecture

This project now uses a centralized type system with shared contracts and composables for all API endpoints.

## Structure

### Shared Types (`/shared/types/`)
- **userContracts.d.ts** - User entity types, request/response schemas
- **tournamentContracts.d.ts** - Tournament entity types and schemas  
- **coupleContracts.d.ts** - Couple entity types and schemas
- **matchContracts.d.ts** - Match entity types and schemas
- **predictionContracts.d.ts** - Prediction entity types and schemas
- **authContracts.d.ts** - Auth and common API response types

### Composables (`/app/composables/endpoints/`)
All API operations are available as composables:

#### Users
- `useGetAllUsers()` - GET /api/users
- `useCreateUser()` - POST /api/users
- `useUpdateUser()` - PATCH /api/users/:id
- `useUpdateUserRole()` - PATCH /api/users/role

#### Tournaments
- `useGetAllTournaments()` - GET /api/tournaments
- `useGetTournament(id)` - GET /api/tournaments/:id
- `useCreateTournament()` - POST /api/tournaments
- `useUpdateTournament()` - PATCH /api/tournaments/:id
- `useDeleteTournament()` - DELETE /api/tournaments/:id
- `useGetTournamentStats(id)` - GET /api/tournaments/:id/stats

#### Couples
- `useGetTournamentCouples(tournamentId)` - GET /api/tournaments/:id/couples
- `useCreateCouple()` - POST /api/tournaments/:id/couples

#### Matches
- `useGetTournamentMatches(tournamentId)` - GET /api/tournaments/:id/matches
- `useCreateMatch()` - POST /api/tournaments/:id/matches
- `useGenerateMatches()` - POST /api/tournaments/:id/matches/generate
- `useUpdateMatchResult()` - PATCH /api/tournaments/:id/matches/:matchId/result

#### Predictions
- `useGetAllPredictions()` - GET /api/predictions
- `useCreatePrediction()` - POST /api/predictions
- `useUpdatePrediction()` - PATCH /api/predictions/:id
- `useDeletePrediction()` - DELETE /api/predictions/:id

## Usage

### In Components
```vue
<script setup>
// All composables are auto-imported
const { tournaments, pending, error, refresh } = useGetAllTournaments()

const { createTournament } = useCreateTournament()

const handleCreate = async (data) => {
  try {
    await createTournament(data)
    refresh() // Refresh the list
  } catch (err) {
    console.error('Failed to create tournament:', err)
  }
}
</script>
```

### In Server Endpoints
```typescript
import type { UserPostBody, UserResponse } from '#shared/types'

export default defineEventHandler(async (event): Promise<UserResponse> => {
  const body = await readBody(event) as UserPostBody
  // Type-safe request and response
})
```

## Benefits

1. **Type Safety** - Shared types ensure consistency between frontend and backend
2. **Auto-completion** - Full IntelliSense support in IDE
3. **Reusability** - Composables can be used across multiple components
4. **Maintainability** - Single source of truth for API contracts
5. **Error Prevention** - Compile-time type checking prevents runtime errors
