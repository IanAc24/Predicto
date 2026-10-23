import { useEffect, useState } from 'react'

/** True once `active` has been true for `ms`, so quick loads do not flash a loading card. */
export function useAfterDelay(active: boolean, ms: number): boolean {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setElapsed(true), ms)
    return () => {
      clearTimeout(timer)
      setElapsed(false)
    }
  }, [active, ms])
  return active && elapsed
}
