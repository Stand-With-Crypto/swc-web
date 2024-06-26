import { UserActionType } from '@prisma/client'

import { STATE_COORDS } from '@/components/app/pageAdvocatesHeatmap/constants'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export interface MapMarker {
  name: string
  coordinates: [number, number]
  actionType: UserActionType
  datetimeCreated: string
}

export const createMarkersFromActions = (recentActivity: PublicRecentActivity) => {
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
