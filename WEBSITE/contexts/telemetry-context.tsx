"use client"

// The ONE client-side telemetry subscription for the entire dashboard.
//
// TelemetryProvider opens a single EventSource connection to
// /api/telemetry/stream (falling back to polling /api/telemetry/ingest if
// EventSource isn't available or the stream errors out) and republishes
// every update through React context. Every hook/card in this app calls
// `useTelemetry()` to read the latest snapshot — nothing else opens its own
// connection, polls its own endpoint, or keeps its own copy of the data.
//
// This is intentionally dumb: it does not interpret, classify, or derive
// anything from the telemetry (no health ratings, no "is this good or bad" —
// that logic lives in the hooks that consume this data). It just keeps the
// latest snapshot (plus a short rolling history) in sync with the server.

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { EMPTY_TELEMETRY, type WheelchairTelemetry } from "@/lib/telemetry-types"

const HISTORY_LENGTH = 120
const POLL_FALLBACK_MS = 1000

interface TelemetryContextValue {
  telemetry: WheelchairTelemetry
  history: WheelchairTelemetry[]
  /** True once the first snapshot (from the server) has been received. */
  ready: boolean
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null)

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetry] = useState<WheelchairTelemetry>(EMPTY_TELEMETRY)
  const [history, setHistory] = useState<WheelchairTelemetry[]>([])
  const [ready, setReady] = useState(false)
  const historyRef = useRef<WheelchairTelemetry[]>([])

  const applySnapshot = (snapshot: WheelchairTelemetry) => {
    setTelemetry(snapshot)
    setReady(true)
    historyRef.current = [...historyRef.current.slice(-(HISTORY_LENGTH - 1)), snapshot]
    setHistory(historyRef.current)
  }

  useEffect(() => {
    let cancelled = false
    let pollTimer: ReturnType<typeof setInterval> | null = null
    let source: EventSource | null = null

    const startPolling = () => {
      if (pollTimer || cancelled) return
      const poll = async () => {
        try {
          const res = await fetch("/api/telemetry/ingest", { cache: "no-store" })
          if (!res.ok) return
          const data: WheelchairTelemetry = await res.json()
          if (!cancelled) applySnapshot(data)
        } catch {
          // Network hiccup — next poll tick will retry.
        }
      }
      poll()
      pollTimer = setInterval(poll, POLL_FALLBACK_MS)
    }

    if (typeof window !== "undefined" && "EventSource" in window) {
      source = new EventSource("/api/telemetry/stream")
      source.onmessage = (event) => {
        if (cancelled) return
        try {
          const data: WheelchairTelemetry = JSON.parse(event.data)
          applySnapshot(data)
        } catch {
          // Ignore malformed/heartbeat frames.
        }
      }
      source.onerror = () => {
        // EventSource auto-reconnects on its own; if it can't connect at all
        // (e.g. dev proxy strips SSE) fall back to polling as a safety net.
        if (!pollTimer) startPolling()
      }
    } else {
      startPolling()
    }

    return () => {
      cancelled = true
      source?.close()
      if (pollTimer) clearInterval(pollTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ telemetry, history, ready }), [telemetry, history, ready])

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>
}
