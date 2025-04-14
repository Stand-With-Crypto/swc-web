import { FC, MouseEvent, useCallback, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { AnimatePresence } from 'motion/react'

import { ActionInfoTooltip } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapActionTooltip'
import { IconProps } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapIcons'
import { AdvocateHeatmapMarker } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapMarker'
import { useAdvocateMap } from '@/components/app/pageAdvocatesHeatmap/common/useAdvocateMap'
import { GB_ADVOCATES_HEATMAP_GEO_URL } from '@/components/app/pageAdvocatesHeatmap/gb/constants'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getGBCountryCodeFromName } from '@/utils/shared/stateMappings/gbCountryUtils'

const countryCode = SupportedCountryCodes.GB

export const GBMapComponent = ({
  actions,
  handleStateMouseHover,
  handleStateMouseOut,
  isEmbedded,
}: {
  actions: PublicRecentActivity
  handleStateMouseHover: (geo: any, event: MouseEvent<SVGPathElement>) => void
  handleStateMouseOut: () => void
  isEmbedded?: boolean
}) => {
  const parsedCountryStateNameActions = useMemo(() => {
    return actions.map(action => {
      return {
        ...action,
        user: {
          ...action.user,
          userLocationDetails: {
            ...action.user.userLocationDetails,
            administrativeAreaLevel1: getGBCountryCodeFromName(
              action.user.userLocationDetails?.administrativeAreaLevel1 ?? '',
            ),
          },
        },
      }
    })
  }, [actions, countryCode]) as PublicRecentActivity

  const markers = useAdvocateMap(parsedCountryStateNameActions)
  const [actionInfo, setActionInfo] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  const currentFill = isEmbedded ? '#171717' : '#F4EEFF'
  const currentStroke = isEmbedded ? '#3A3B3D' : '#DAC5FF'
  const currentHoverAndPressedFill = isEmbedded ? '#6100FF' : '#DDC9FF'

  const handleActionMouseOver = useCallback(
    (currentActionInfo: string, event: MouseEvent<SVGElement>) => {
      event.stopPropagation()

      const actionBoundingClientRect = event.currentTarget.getBoundingClientRect()
      const actionPosition = {
        x: actionBoundingClientRect.left + actionBoundingClientRect.width / 2,
        y: actionBoundingClientRect.top + actionBoundingClientRect.height / 2,
      }

      setActionInfo(currentActionInfo)
      setMousePosition(actionPosition)
    },
    [],
  )

  const handleActionMouseLeave = useCallback((event?: MouseEvent<SVGElement>) => {
    event?.stopPropagation()
    setMousePosition(null)
    setActionInfo(null)
  }, [])

  console.log('markers', markers)

  return (
    <>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [-2.5, 54.6],
          scale: 2300,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={GB_ADVOCATES_HEATMAP_GEO_URL}>
          {({ geographies }) => (
            <>
              {geographies.map(geo => (
                <Geography
                  geography={geo}
                  key={geo.rsmKey}
                  onMouseMove={event => handleStateMouseHover(geo, event)}
                  onMouseOut={handleStateMouseOut}
                  stroke="#FFF"
                  style={{
                    default: {
                      fill: currentFill,
                      stroke: currentStroke,
                      strokeWidth: '0.777px',
                      outline: 'none',
                      transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                    },
                    hover: {
                      fill: currentHoverAndPressedFill,
                      outline: 'none',
                      stroke: currentStroke,
                      strokeWidth: '0.777px',
                    },
                    pressed: {
                      fill: currentHoverAndPressedFill,
                      outline: 'none',
                      stroke: currentStroke,
                      strokeWidth: '0.777px',
                    },
                  }}
                />
              ))}
              <AnimatePresence>
                {markers.map(({ id, name, coordinates, actionType, iconType, amountUsd }) => {
                  const currentAmountUsd = amountUsd
                    ? FormattedCurrency({
                        amount: amountUsd,
                        locale: COUNTRY_CODE_TO_LOCALE[countryCode],
                        currencyCode: SupportedFiatCurrencyCodes.USD,
                      })
                    : ''
                  const currentActionInfo = `Someone in ${name} ${iconType?.labelActionTooltip(currentAmountUsd) ?? ''}`
                  const IconComponent = iconType?.icon as FC<IconProps>
                  const markerKey = `${name}-${actionType}-${id}`

                  return (
                    <AdvocateHeatmapMarker
                      IconComponent={IconComponent}
                      coordinates={coordinates}
                      currentActionInfo={currentActionInfo}
                      handleActionMouseLeave={handleActionMouseLeave}
                      handleActionMouseOver={handleActionMouseOver}
                      key={markerKey}
                    />
                  )
                })}
              </AnimatePresence>
            </>
          )}
        </Geographies>
      </ComposableMap>
      <ActionInfoTooltip
        actionInfo={actionInfo}
        handleClearPressedState={handleActionMouseLeave}
        mousePosition={mousePosition}
      />
    </>
  )
}
