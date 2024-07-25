import { useEffect, useMemo, useState } from 'react'
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

const createMarkersFromActions = (recentActivity: PublicRecentActivity): MapMarker[] => {
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

const MAX_MARKERS = 10
const ADVOCATE_MAP_INTERVAL = 2000

let STARTING_MARKERS = 5

export function useAdvocateMap({ actions }: UseAdvocateMapProps) {
  const [displayedMarkers, setDisplayedMarkers] = useState<MapMarker[]>([])
  const [currentActionIndex, setCurrentActionIndex] = useState(0)

  const markers = useMemo(() => createMarkersFromActions(actions), [actions])

  if (displayedMarkers.length === MAX_MARKERS) {
    STARTING_MARKERS = MAX_MARKERS
  }

  useEffect(() => {
    const initialMarkers = markers.slice(0, STARTING_MARKERS)
    setDisplayedMarkers(initialMarkers)
    setCurrentActionIndex(STARTING_MARKERS)
  }, [markers])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDisplayedMarkers(prev => {
        let newMarkers = [...prev]

        if (newMarkers.length < MAX_MARKERS) {
          newMarkers.push(markers[currentActionIndex % markers.length])
        } else {
          newMarkers = [...newMarkers.slice(1), markers[currentActionIndex % markers.length]]
        }

        setCurrentActionIndex(prevIndex => (prevIndex + 1) % markers.length)

        return newMarkers
      })
    }, ADVOCATE_MAP_INTERVAL)

    return () => clearInterval(intervalId)
  }, [currentActionIndex, markers])

  return displayedMarkers
}
