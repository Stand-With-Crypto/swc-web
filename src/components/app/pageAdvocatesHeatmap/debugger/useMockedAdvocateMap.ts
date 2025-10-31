import { useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'

import {
  applyCoordinatesOffset,
  getMarkerPositions,
} from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap.utils'
import {
  AdvocateHeatmapAction,
  ADVOCATES_ACTIONS_BY_COUNTRY_CODE,
  AREA_COORDS_BY_COUNTRY_CODE,
  AreaCoordinates,
  AreaCoordinatesKey,
  AREAS_WITH_SINGLE_MARKER,
  MapProjectionConfig,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import {
  getMapAdministrativeAreaName,
  MapMarker,
} from '@/components/app/pageAdvocatesHeatmap/useAdvocateMap'
import { useCountryCode } from '@/hooks/useCountryCode'
import { getLogger } from '@/utils/shared/logger'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const logger = getLogger('useMockedAdvocateMap')

function getMarkerMocker({
  actions,
  coordinates,
  countryCode,
  mapMarkerOffset,
  shouldRandomizeMarkerOffsets,
}: {
  actions: Partial<Record<UserActionType, AdvocateHeatmapAction>>
  coordinates: AreaCoordinates
  countryCode: SupportedCountryCodes
  mapMarkerOffset: number
  shouldRandomizeMarkerOffsets?: boolean
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

    const administrativeAreaName = getMapAdministrativeAreaName(countryCode, administrativeArea)

    if (AREAS_WITH_SINGLE_MARKER.includes(administrativeArea)) {
      return [
        {
          id: '1',
          name: administrativeAreaName,
          coordinates: applyCoordinatesOffset(administrativeAreaCoords, 0, 0),
          actionType: UserActionType.EMAIL,
          datetimeCreated: '2021-01-01',
          iconType: getRandomAction(),
        },
      ]
    }

    const actionCoords = getMarkerPositions({
      administrativeArea,
      coordinates: administrativeAreaCoords,
      countryCode,
      offset: mapMarkerOffset,
      shouldRandomizeMarkerOffsets,
    })

    return [
      {
        id: '1',
        name: administrativeAreaName,
        coordinates: actionCoords[0],
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
      {
        id: '2',
        name: administrativeAreaName,
        coordinates: actionCoords[1],
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
      {
        id: '3',
        name: administrativeAreaName,
        coordinates: actionCoords[2],
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
    ]
  }
}

const createMarkersFromActions = ({
  actionsLimit = 20,
  countryCode,
  mapMarkerOffset = 1,
  overrideCoordinates,
  selectedAreas,
  shouldRandomizeMarkerOffsets = false,
}: {
  actionsLimit?: number
  countryCode: SupportedCountryCodes
  mapMarkerOffset?: number
  overrideCoordinates?: AreaCoordinates
  selectedAreas?: AreaCoordinatesKey[]
  shouldRandomizeMarkerOffsets?: boolean
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
    actions,
    coordinates: overrideCoordinates || coordinates,
    countryCode,
    mapMarkerOffset,
    shouldRandomizeMarkerOffsets,
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
        actionsLimit,
        countryCode,
        mapMarkerOffset: mapConfig.markerOffset,
        overrideCoordinates: coordinates,
        selectedAreas,
        shouldRandomizeMarkerOffsets: mapConfig.shouldRandomizeMarkerOffsets,
      }),
    )
  }, [countryCode, mapConfig, coordinates, selectedAreas, actionsLimit])

  return displayedMarkers
}
