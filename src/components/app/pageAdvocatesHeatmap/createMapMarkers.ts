import { UserActionType } from '@prisma/client'

import { STATE_COORDS } from '@/components/app/pageAdvocatesHeatmap/constants'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export interface MapMarker {
  name: string
  coordinates: [number, number]
  actionType?: UserActionType
}

export const createMarkersFromActions = (recentActivity: PublicRecentActivity) => {
  const markers: MapMarker[] = []

  const addedStates = new Set<string>()

  recentActivity.forEach(item => {
    const userLocation = item.user.userLocationDetails

    if (userLocation && userLocation.administrativeAreaLevel1) {
      const state = userLocation.administrativeAreaLevel1

      if (!addedStates.has(state)) {
        const coordinates = STATE_COORDS[state as keyof typeof STATE_COORDS]

        if (coordinates) {
          markers.push({ name: state, coordinates, actionType: item.actionType })
          addedStates.add(state)
        }
      }
    }
  })

  return markers
}
