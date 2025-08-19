// User composables
export { useGetAllUsers } from './endpoints/users/useGetAllUsers'
export { useCreateUser } from './endpoints/users/useCreateUser'
export { useUpdateUser } from './endpoints/users/useUpdateUser'
export { useUpdateUserRole } from './endpoints/users/useUpdateUserRole'

// Tournament composables
export { useGetAllTournaments } from './endpoints/tournaments/useGetAllTournaments'
export { useGetTournament } from './endpoints/tournaments/useGetTournament'
export { useCreateTournament } from './endpoints/tournaments/useCreateTournament'
export { useUpdateTournament } from './endpoints/tournaments/useUpdateTournament'
export { useDeleteTournament } from './endpoints/tournaments/useDeleteTournament'
export { useGetTournamentStats } from './endpoints/tournaments/useGetTournamentStats'

// Couple composables
export { useGetTournamentCouples } from './endpoints/couples/useGetTournamentCouples'
export { useCreateCouple } from './endpoints/couples/useCreateCouple'

// Match composables
export { useGetTournamentMatches } from './endpoints/matches/useGetTournamentMatches'
export { useCreateMatch } from './endpoints/matches/useCreateMatch'
export { useGenerateMatches } from './endpoints/matches/useGenerateMatches'
export { useUpdateMatchResult } from './endpoints/matches/useUpdateMatchResult'

// Prediction composables
export { useGetAllPredictions } from './endpoints/predictions/useGetAllPredictions'
export { useCreatePrediction } from './endpoints/predictions/useCreatePrediction'
export { useUpdatePrediction } from './endpoints/predictions/useUpdatePrediction'
export { useDeletePrediction } from './endpoints/predictions/useDeletePrediction'
