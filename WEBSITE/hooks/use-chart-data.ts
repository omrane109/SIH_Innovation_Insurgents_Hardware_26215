"use client"

import { useState, useEffect } from "react"
import type { EEGReading } from "@/lib/eeg-data-types"

export function useChartData(currentReading: EEGReading | null, isRecording: boolean) {
  const [chartData, setChartData] = useState<EEGReading[]>([])

  useEffect(() => {
    if (!currentReading) return

    setChartData((prev) => {
      const newData = [...prev, currentReading]

      // Keep only the last 200 readings for performance
      if (newData.length > 200) {
        return newData.slice(-200)
      }

      return newData
    })
  }, [currentReading])

  // Clear data when not recording
  useEffect(() => {
    if (!isRecording) {
      setChartData([])
    }
  }, [isRecording])

  return chartData
}
