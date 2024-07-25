import { useEffect, useMemo, useRef, useState } from 'react'
import { UserActionType } from '@prisma/client'

import { STATE_COORDS } from '@/components/app/pageAdvocatesHeatmap/constants'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

interface UseAdvocateMapProps {
  actions: PublicRecentActivity
}

export interface MapMarker {
  name: string
  coordinates: [number, number]
  actionType: UserActionType
  datetimeCreated: string
}

const createMarkersFromActions = (recentActivity: PublicRecentActivity) => {
  const markers: MapMarker[] = []
  const stateCount: Record<string, number> = {}

  recentActivity.forEach(item => {
    const userLocation = item.user.userLocationDetails

    if (userLocation && userLocation.administrativeAreaLevel1) {
      const state = userLocation.administrativeAreaLevel1

      const coordinates = STATE_COORDS[state as keyof typeof STATE_COORDS]

      if (coordinates) {
        let offsetX = 0
        let offsetY = 0

        if (stateCount[state]) {
          offsetX = stateCount[state] % 2 === 0 ? 1.2 : -1.2
          offsetY = stateCount[state] % 2 === 0 ? -1.2 : 1.2

          stateCount[state] += 1
        } else {
          stateCount[state] = 1
        }

        markers.push({
          name: state,
          coordinates: [coordinates[0] + offsetX, coordinates[1] + offsetY],
          actionType: item.actionType,
          datetimeCreated: item.datetimeCreated,
        })
      }
    }
  })

  return markers
}

export function useAdvocateMap({ actions }: UseAdvocateMapProps) {
  const [displayedMarkers, setDisplayedMarkers] = useState<MapMarker[]>([])
  const [currentActionIndex, setCurrentActionIndex] = useState(5)

  const markers = useMemo(() => createMarkersFromActions(actions), [actions])

  useEffect(() => {
    const initialMarkers = markers.slice(0, 5)
    setDisplayedMarkers(initialMarkers)
    setCurrentActionIndex(5)
  }, [markers])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDisplayedMarkers(prev => {
        const newMarkers = [...prev]
        if (currentActionIndex < markers.length) {
          if (newMarkers.length >= 10) {
            newMarkers.shift()
          }
          newMarkers.push(markers[currentActionIndex])
          setCurrentActionIndex(currentActionIndex + 1)
        } else {
          clearInterval(intervalId)
        }
        return newMarkers
      })
    }, 2000)

    return () => clearInterval(intervalId)
  }, [currentActionIndex, markers])

  return {
    markers: displayedMarkers,
  }
}
