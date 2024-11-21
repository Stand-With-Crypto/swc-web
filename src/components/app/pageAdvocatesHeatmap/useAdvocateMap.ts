import { useEffect, useMemo, useState } from 'react'
import { UserActionType } from '@prisma/client'

import { ADVOCATES_ACTIONS, STATE_COORDS } from '@/components/app/pageAdvocatesHeatmap/constants'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export interface MapMarker {
  id: string
  name: string
  coordinates: [number, number]
  actionType: UserActionType
  datetimeCreated: string
  iconType: (typeof ADVOCATES_ACTIONS)[keyof typeof ADVOCATES_ACTIONS]
  amountUsd?: number
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

        const currentIconActionType =
          ADVOCATES_ACTIONS[item.actionType as keyof typeof ADVOCATES_ACTIONS]

        if (!currentIconActionType) {
          return
        }

        markers.push({
          id: item.id,
          name: state,
          coordinates: [coordinates[0] + offsetX, coordinates[1] + offsetY],
          actionType: item.actionType,
          datetimeCreated: item.datetimeCreated,
          iconType: currentIconActionType,
          amountUsd: 'amountUsd' in item ? item.amountUsd : undefined,
        })
      }
    }
  })

  return markers
}

const markersAreSame = (arr1: MapMarker[], arr2: MapMarker[]): boolean => {
  if (arr1.length !== arr2.length) return false
  const ids1 = arr1.map(marker => marker.id).sort()
  const ids2 = arr2.map(marker => marker.id).sort()
  return ids1.every((id, index) => id === ids2[index])
}

const INITIAL_MARKERS = 5
const MAX_MARKERS = 20
const ADVOCATE_MAP_INTERVAL = 2000

export function useAdvocateMap(actions: PublicRecentActivity) {
  const [displayedMarkers, setDisplayedMarkers] = useState<MapMarker[]>([])
  const [totalMarkers, setTotalMarkers] = useState<number>(INITIAL_MARKERS - 1)

  const markers = useMemo(() => createMarkersFromActions(actions), [actions])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (totalMarkers < MAX_MARKERS) {
        setTotalMarkers(prevTotal => Math.min(Math.max(prevTotal + 1, 0), MAX_MARKERS))
      }
    }, ADVOCATE_MAP_INTERVAL)

    return () => clearInterval(intervalId)
  }, [totalMarkers])

  useEffect(() => {
    setDisplayedMarkers(prev => {
      if (markersAreSame(prev, markers)) {
        return prev
      }

      return markers.slice(0, totalMarkers)
    })
  }, [markers, totalMarkers])

  return useMemo(() => displayedMarkers, [displayedMarkers])
}
