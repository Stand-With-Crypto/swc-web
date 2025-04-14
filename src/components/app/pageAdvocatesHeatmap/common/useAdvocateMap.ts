import { ReactNode, useEffect, useMemo, useState } from 'react'
import { UserActionType } from '@prisma/client'

import { ActionListItem } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapActionList'
import { IconProps } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapIcons'
import {
  getCoordinates,
  getMapActions,
} from '@/components/app/pageAdvocatesHeatmap/common/constants'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useCountryCode } from '@/hooks/useCountryCode'

export interface MapMarker {
  id: string
  name: string
  coordinates: [number, number]
  actionType: UserActionType
  datetimeCreated: string
  iconType: {
    icon: (args: IconProps) => ReactNode
    label: string
    labelMobile: string
    labelActionTooltip: (extraText?: string) => string
  }
  amountUsd?: number
}

const createMarkersFromActions = (
  recentActivity: PublicRecentActivity,
  coordinates: Record<string, [number, number]>,
  mapActions: ActionListItem,
): MapMarker[] => {
  const markers: MapMarker[] = []
  const stateCount: Record<string, number> = {}

  recentActivity.forEach(item => {
    const userLocation = item.user.userLocationDetails

    if (userLocation && userLocation.administrativeAreaLevel1) {
      const state = userLocation.administrativeAreaLevel1

      if (coordinates[state]) {
        let offsetX = 0
        let offsetY = 0

        if (stateCount[state]) {
          offsetX = stateCount[state] % 2 === 0 ? 1.2 : -1.2
          offsetY = stateCount[state] % 2 === 0 ? -1.2 : 1.2

          stateCount[state] += 1
        } else {
          stateCount[state] = 1
        }

        const currentIconActionType = mapActions[item.actionType as keyof typeof mapActions]

        if (!currentIconActionType) {
          return
        }

        markers.push({
          id: item.id,
          name: state,
          coordinates: [coordinates[state][0] + offsetX, coordinates[state][1] + offsetY],
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
  const countryCode = useCountryCode()

  const coordinates = useMemo(() => getCoordinates(countryCode), [countryCode])
  const mapActions = useMemo(() => getMapActions(countryCode), [countryCode])

  const markers = useMemo(
    () => createMarkersFromActions(actions, coordinates, mapActions),
    [actions, coordinates, mapActions],
  )

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
