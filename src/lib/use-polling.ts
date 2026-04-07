import { useCallback, useEffect, useRef, useState } from 'react'

type UsePollingResult<T> = {
  data: T | null
  error: Error | null
  isLoading: boolean
  refresh: () => Promise<void>
}

export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervalMs: number,
  enabled = true,
): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  const run = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    try {
      const next = await fetcherRef.current(controller.signal)
      if (!controller.signal.aborted && mountedRef.current) {
        setData(next)
        setError(null)
      }
    } catch (caught) {
      if (controller.signal.aborted || !mountedRef.current) {
        return
      }
      setError(
        caught instanceof Error ? caught : new Error('Unknown polling error'),
      )
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    if (!enabled) {
      return () => {
        mountedRef.current = false
        abortRef.current?.abort()
      }
    }

    void run()

    let timer: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (timer != null) return
      timer = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return
        void run()
      }, intervalMs)
    }

    const stop = () => {
      if (timer != null) {
        clearInterval(timer)
        timer = null
      }
    }

    start()

    const handleVisibility = () => {
      if (typeof document === 'undefined') return
      if (document.hidden) {
        stop()
      } else {
        void run()
        start()
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility)
    }

    return () => {
      mountedRef.current = false
      stop()
      abortRef.current?.abort()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }
  }, [enabled, intervalMs, run])

  const refresh = useCallback(async () => {
    await run()
  }, [run])

  return { data, error, isLoading, refresh }
}
