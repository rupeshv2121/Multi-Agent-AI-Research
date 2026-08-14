import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchHealth } from '@/services/research'
import { useResearchStore } from '@/store/researchStore'

/**
 * Poll `/api/health` so the UI can warn about missing API keys *before* someone
 * waits on a run that is going to fail, and so the agent roster comes from the
 * backend rather than a hardcoded list.
 */
export function useHealth() {
  const setRoster = useResearchStore((s) => s.setRoster)

  const query = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 60_000,
    retry: 1,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (query.data?.steps?.length) setRoster(query.data.steps)
  }, [query.data, setRoster])

  const keys = query.data?.keys
  return {
    ...query,
    online: !query.isError && !!query.data?.ok,
    missingKeys: keys ? Object.entries(keys).filter(([, present]) => !present).map(([name]) => name) : [],
  }
}
