import { STATE_COORDS } from '@/components/app/pageAdvocatesHeatmap/constants'
import { AdvocatePerState } from '@/data/aggregations/getTotalAdvocatesPerState'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export interface MapMarker {
  name: string
  coordinates: [number, number]
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
          markers.push({ name: state, coordinates })
          addedStates.add(state)
        }
      }
    }
  })

  return markers
}

export const createMarkersFromTopAdvocateStates = (advocatesMapData: AdvocatePerState[]) => {
  return advocatesMapData.map<MapMarker>(({ state }) => {
    const coordinates = STATE_COORDS[state as keyof typeof STATE_COORDS] ?? [0, 0]

    return { name: state, coordinates }
  })
}
