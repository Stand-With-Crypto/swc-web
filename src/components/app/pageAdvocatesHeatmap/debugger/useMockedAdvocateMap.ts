import { useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'

import {
  AdvocateHeatmapAction,
  ADVOCATES_ACTIONS_BY_COUNTRY_CODE,
  AREA_COORDS_BY_COUNTRY_CODE,
  AreaCoordinates,
  AreaCoordinatesKey,
  AREAS_WITH_SINGLE_MARKER,
  MapProjectionConfig,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { MapMarker } from '@/components/app/pageAdvocatesHeatmap/useAdvocateMap'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('useMockedAdvocateMap')

function applyCoordinatesOffset(
  coordinates: [number, number],
  offsetX: number,
  offsetY: number,
): [number, number] {
  return [coordinates[0] + offsetX, coordinates[1] + offsetY]
}

function getMarkerMocker({
  mapMarkerOffset,
  actions,
  coordinates,
}: {
  mapMarkerOffset: number
  actions: Partial<Record<UserActionType, AdvocateHeatmapAction>>
  coordinates: AreaCoordinates
}) {
  const getRandomAction = () => {
    const actionKeys = Object.keys(actions)
    const randomIndex = Math.floor(Math.random() * actionKeys.length)
    return actions[actionKeys[randomIndex] as UserActionType] ?? actions.OPT_IN!
  }

  return (administrativeArea: AreaCoordinatesKey) => {
    const administrativeAreaCoords = coordinates[administrativeArea as keyof AreaCoordinates]

    if (!administrativeAreaCoords) {
      logger.error(`No coordinates found for ${administrativeArea}`)
      return []
    }

    if (AREAS_WITH_SINGLE_MARKER.includes(administrativeArea)) {
      return [
        {
          id: '1',
          name: administrativeArea,
          coordinates: applyCoordinatesOffset(administrativeAreaCoords, 0, 0),
          actionType: UserActionType.EMAIL,
          datetimeCreated: '2021-01-01',
          iconType: getRandomAction(),
        },
      ]
    }

    return [
      {
        id: '1',
        name: administrativeArea,
        coordinates: applyCoordinatesOffset(administrativeAreaCoords, 0, 0),
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
      {
        id: '2',
        name: administrativeArea,
        coordinates: applyCoordinatesOffset(
          administrativeAreaCoords,
          -mapMarkerOffset,
          mapMarkerOffset,
        ),
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
      {
        id: '3',
        name: administrativeArea,
        coordinates: applyCoordinatesOffset(
          administrativeAreaCoords,
          mapMarkerOffset,
          -mapMarkerOffset,
        ),
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
    ]
  }
}

const createMarkersFromActions = ({
  countryCode,
  mapMarkerOffset = 1,
  overrideCoordinates,
  selectedAreas,
  actionsLimit = 20,
}: {
  countryCode: SupportedCountryCodes
  mapMarkerOffset?: number
  overrideCoordinates?: AreaCoordinates
  selectedAreas?: AreaCoordinatesKey[]
  actionsLimit?: number
}) => {
  const actions = ADVOCATES_ACTIONS_BY_COUNTRY_CODE[countryCode]
  const coordinates = AREA_COORDS_BY_COUNTRY_CODE[countryCode]

  if (!coordinates) {
    logger.error(`No coordinates found for ${countryCode}`)
    return []
  }

  if (!actions) {
    logger.error(`No actions found for ${countryCode}`)
    return []
  }

  const markerMocker = getMarkerMocker({
    mapMarkerOffset,
    actions,
    coordinates: overrideCoordinates || coordinates,
  })

  if (!selectedAreas) {
    return []
  }

  return selectedAreas
    .map(area => markerMocker(area))
    .flat()
    .sort(() => Math.random() - 0.5)
    .slice(0, actionsLimit)
}

export const useMockedAdvocateMap = ({
  mapConfig,
  coordinates,
  selectedAreas,
  actionsLimit,
}: {
  mapConfig: MapProjectionConfig
  coordinates?: AreaCoordinates
  selectedAreas?: AreaCoordinatesKey[]
  actionsLimit?: number
}) => {
  const [displayedMarkers, setDisplayedMarkers] = useState<MapMarker[]>([])
  const countryCode = useCountryCode()

  useEffect(() => {
    setDisplayedMarkers(
      createMarkersFromActions({
        countryCode,
        mapMarkerOffset: mapConfig.markerOffset,
        overrideCoordinates: coordinates,
        selectedAreas,
        actionsLimit,
      }),
    )
  }, [countryCode, mapConfig, coordinates, selectedAreas])

  return displayedMarkers
}
