import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mockConfig, mockStore } from './mock'
import type { BarRange, UserSettings } from './types'

// These hooks are backed by an in-memory mock store. When the Python backend exists they will
// call the generated OpenAPI client (packages/api-client) instead; query keys and return types stay.

/** Runs a store call after the simulated delay. The 'error' scenario rejects everything. */
function call<T>(run: () => T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (mockStore.scenario === 'error') {
        reject(new Error('Mock API error (scenario=error)'))
        return
      }
      try {
        resolve(run())
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    }, mockConfig.delayMs)
  })
}

export function useWatchlist() {
  return useQuery({ queryKey: ['watchlist'], queryFn: () => call(() => mockStore.getWatchlist()) })
}

export function useInstrument(id: string) {
  return useQuery({
    queryKey: ['instrument', id],
    queryFn: () => call(() => mockStore.getInstrument(id)),
  })
}

export function useBars(id: string, range: BarRange) {
  return useQuery({
    queryKey: ['bars', id, range],
    queryFn: () => call(() => mockStore.getBars(id, range)),
  })
}

export function usePrediction(id: string) {
  return useQuery({
    queryKey: ['prediction', id],
    queryFn: () => call(() => mockStore.getPrediction(id)),
  })
}

export function useLedger(instrumentId?: string) {
  return useQuery({
    queryKey: ['ledger', instrumentId ?? null],
    queryFn: () => call(() => mockStore.getLedger(instrumentId)),
  })
}

export function useTrackRecord() {
  return useQuery({ queryKey: ['trackRecord'], queryFn: () => call(() => mockStore.getTrackRecord()) })
}

export function useDataStatus() {
  return useQuery({ queryKey: ['dataStatus'], queryFn: () => call(() => mockStore.getDataStatus()) })
}

export function useUserSettings() {
  return useQuery({
    queryKey: ['userSettings'],
    queryFn: () => call(() => mockStore.getUserSettings()),
  })
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<UserSettings>) => call(() => mockStore.updateUserSettings(patch)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSettings'] }),
  })
}

export function useSearchInstruments(query: string) {
  return useQuery({
    queryKey: ['search', query.trim().toLowerCase()],
    queryFn: () => call(() => mockStore.searchInstruments(query)),
  })
}

/** Adds an instrument by id; it starts in the 'observing' state at day 1. */
export function useAddToWatchlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (instrumentId: string) => call(() => mockStore.addToWatchlist(instrumentId)),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
        queryClient.invalidateQueries({ queryKey: ['prediction'] }),
      ]),
  })
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (instrumentId: string) => call(() => mockStore.removeFromWatchlist(instrumentId)),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
        queryClient.invalidateQueries({ queryKey: ['prediction'] }),
      ]),
  })
}
