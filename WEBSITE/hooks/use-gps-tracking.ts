"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { logGPSPing, logTrip, logGeofenceBreach } from "@/lib/firebase"

export interface GPSPosition {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  speed: number | null
  heading: number | null
  timestamp: number
}

export interface SafeZone {
  latitude: number
  longitude: number
  radiusMeters: number
}

export interface Destination {
  latitude: number
  longitude: number
  label: string
}

export interface TripRecord {
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  avgSpeedKmh: number
}

/** Haversine distance in meters between two lat/lng points. */
function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371000
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function useGPSTracking() {
  const [position, setPosition] = useState<GPSPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [history, setHistory] = useState<GPSPosition[]>([])
  const watchIdRef = useRef<number | null>(null)

  const [safeZone, setSafeZone] = useState<SafeZone | null>(null)
  const [destination, setDestination] = useState<Destination | null>(null)

  const [activeTripStart, setActiveTripStart] = useState<{ position: GPSPosition; startedAt: number } | null>(null)
  const [activeTripDistance, setActiveTripDistance] = useState(0)
  const [trips, setTrips] = useState<TripRecord[]>([])

  const lastLoggedRef = useRef<number>(0)

  const startTracking = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setError(null)
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: GPSPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
        }
        setPosition(newPos)
        setHistory((prev) => [...prev.slice(-99), newPos])

        // Throttle Firestore/console pings to ~once every 5s to avoid spamming writes
        if (Date.now() - lastLoggedRef.current > 5000) {
          lastLoggedRef.current = Date.now()
          logGPSPing(newPos)
        }
      },
      (err) => {
        setError(err.message)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      },
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  // Accumulate trip distance as new positions arrive while a trip is active
  const prevPosRef = useRef<GPSPosition | null>(null)
  useEffect(() => {
    if (position && activeTripStart && prevPosRef.current) {
      const d = distanceMeters(prevPosRef.current, position)
      // ignore GPS jitter under ~2m
      if (d > 2) setActiveTripDistance((prev) => prev + d)
    }
    prevPosRef.current = position
  }, [position, activeTripStart])

  const startTrip = useCallback(() => {
    if (!position) return
    setActiveTripStart({ position, startedAt: Date.now() })
    setActiveTripDistance(0)
    prevPosRef.current = position
  }, [position])

  const endTrip = useCallback(() => {
    if (!activeTripStart) return
    const endedAt = Date.now()
    const durationSeconds = Math.max(1, (endedAt - activeTripStart.startedAt) / 1000)
    const record: TripRecord = {
      startedAt: activeTripStart.startedAt,
      endedAt,
      distanceMeters: activeTripDistance,
      durationSeconds,
      avgSpeedKmh: (activeTripDistance / 1000) / (durationSeconds / 3600),
    }
    setTrips((prev) => [record, ...prev].slice(0, 20))
    logTrip(record)
    setActiveTripStart(null)
    setActiveTripDistance(0)
  }, [activeTripStart, activeTripDistance])

  // Geofence check
  const distanceFromSafeZoneCenter = useMemo(() => {
    if (!position || !safeZone) return null
    return distanceMeters(position, safeZone)
  }, [position, safeZone])

  const isOutsideSafeZone = useMemo(() => {
    if (distanceFromSafeZoneCenter == null || !safeZone) return false
    return distanceFromSafeZoneCenter > safeZone.radiusMeters
  }, [distanceFromSafeZoneCenter, safeZone])

  const breachLoggedRef = useRef(false)
  useEffect(() => {
    if (isOutsideSafeZone && !breachLoggedRef.current && position && safeZone && distanceFromSafeZoneCenter != null) {
      breachLoggedRef.current = true
      logGeofenceBreach({
        latitude: position.latitude,
        longitude: position.longitude,
        safeZoneRadiusMeters: safeZone.radiusMeters,
        distanceMeters: distanceFromSafeZoneCenter,
        timestamp: Date.now(),
      })
    }
    if (!isOutsideSafeZone) breachLoggedRef.current = false
  }, [isOutsideSafeZone, position, safeZone, distanceFromSafeZoneCenter])

  // Destination ETA/distance
  const distanceToDestination = useMemo(() => {
    if (!position || !destination) return null
    return distanceMeters(position, destination)
  }, [position, destination])

  const etaMinutes = useMemo(() => {
    if (distanceToDestination == null) return null
    const speedKmh = position?.speed ? Math.max(1.5, position.speed * 3.6) : 4 // assume walking-chair pace if stationary
    return (distanceToDestination / 1000 / speedKmh) * 60
  }, [distanceToDestination, position])

  return {
    position,
    error,
    isTracking,
    history,
    startTracking,
    stopTracking,

    safeZone,
    setSafeZone,
    isOutsideSafeZone,
    distanceFromSafeZoneCenter,

    destination,
    setDestination,
    distanceToDestination,
    etaMinutes,

    trip: activeTripStart ? { startedAt: activeTripStart.startedAt, distanceMeters: activeTripDistance } : null,
    startTrip,
    endTrip,
    trips,
  }
}
