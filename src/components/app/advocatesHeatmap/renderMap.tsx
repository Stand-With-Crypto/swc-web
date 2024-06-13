'use client'

import { useCallback, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

import { TotalAdvocatesPerStateTooltip } from '@/components/app/advocatesHeatmap/advocatesHeatmapTooltip'
import { ADVOCATES_HEATMAP_GEO_URL } from '@/components/app/advocatesHeatmap/constants'
import { MapMarker } from '@/components/app/advocatesHeatmap/createMapMarkers'
import { SupportedLocale } from '@/intl/locales'

interface RenderMapProps {
  locale: SupportedLocale
  markers: MapMarker[]
  topStateMarkers: MapMarker[]
  getTotalAdvocatesPerState: (stateName: string) => number | undefined
}

export function RenderMap({
  locale,
  markers,
  topStateMarkers,
  getTotalAdvocatesPerState,
}: RenderMapProps) {
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null)

  const handleStateMouseHover = useCallback((geo: any) => {
    setHoveredStateName(geo.properties.name)
  }, [])

  const handleStateMouseOut = useCallback(() => {
    setHoveredStateName(null)
  }, [])

  return (
    <>
      <ComposableMap projection="geoAlbersUsa">
        <Geographies geography={ADVOCATES_HEATMAP_GEO_URL}>
          {({ geographies }) => {
            return (
              <>
                {geographies.map(geo => {
                  return (
                    <Geography
                      cursor="pointer"
                      geography={geo}
                      key={geo.rsmKey}
                      onMouseMove={() => handleStateMouseHover(geo)}
                      onMouseOut={handleStateMouseOut}
                      stroke="#FFF"
                      style={{
                        default: {
                          fill: '#F6F1FF',
                          stroke: '#6100FF',
                          outline: 'none',
                          transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                        },
                        hover: {
                          fill: '#6100FF',
                          outline: 'none',
                        },
                        pressed: {
                          fill: '#6100FF',
                          outline: 'none',
                        },
                      }}
                    />
                  )
                })}
                {markers.map(({ name, coordinates }) => {
                  return (
                    <Marker
                      coordinates={coordinates}
                      key={name}
                      style={{
                        default: {
                          pointerEvents: 'none',
                        },
                      }}
                    >
                      <circle fill="#6100FF" r={4} />
                    </Marker>
                  )
                })}
                {topStateMarkers.map(({ name, coordinates }) => {
                  const isCurrentStateBeingHovered = hoveredStateName === name

                  return (
                    <Marker
                      coordinates={coordinates}
                      key={name}
                      style={{
                        default: {
                          pointerEvents: 'none',
                        },
                      }}
                    >
                      <circle
                        className={`${isCurrentStateBeingHovered ? 'animate-none opacity-0' : 'animate-pulse opacity-100'} transition-opacity`}
                        fill="#6100FF"
                        paintOrder="stroke"
                        r={4}
                        stroke="#D0B4FF"
                        strokeWidth={24}
                      />
                    </Marker>
                  )
                })}
              </>
            )
          }}
        </Geographies>
      </ComposableMap>
      <TotalAdvocatesPerStateTooltip
        currentState={hoveredStateName}
        getTotalAdvocatesPerState={getTotalAdvocatesPerState}
        locale={locale}
      />
    </>
  )
}
