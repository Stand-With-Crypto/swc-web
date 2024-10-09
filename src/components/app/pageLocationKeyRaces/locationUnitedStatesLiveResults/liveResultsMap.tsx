'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

import { ADVOCATES_HEATMAP_GEO_URL } from '@/components/app/pageAdvocatesHeatmap/constants'

export function LiveResultsMap() {
  return (
    <ComposableMap
      projection="geoAlbersUsa"
      style={{ width: '100%', height: '100%' }}
      viewBox="-20 40 850 550"
    >
      <Geographies geography={ADVOCATES_HEATMAP_GEO_URL}>
        {({ geographies }) => (
          <>
            {geographies.map(geo => (
              <Geography
                geography={geo}
                key={geo.rsmKey}
                onMouseMove={event => console.log(geo, event)}
                onMouseOut={console.log}
                stroke="#FFF"
                style={{
                  default: {
                    fill: '#F4EEFF',
                    stroke: '#DAC5FF',
                    strokeWidth: '0.777px',
                    outline: 'none',
                    transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                  },
                  hover: {
                    fill: '#6200FF',
                    outline: 'none',
                    stroke: '#DAC5FF',
                    strokeWidth: '0.777px',
                    transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                  },
                  pressed: {
                    fill: '#DDC9FF',
                    outline: 'none',
                    stroke: '#DAC5FF',
                    strokeWidth: '0.777px',
                  },
                }}
              />
            ))}
            {/* <AnimatePresence>
                    {[{}].map(({ id, name, coordinates, actionType, iconType }) => {
                      const currentActionInfo = `Someone in ${name} ${iconType?.labelActionTooltip ?? ''}`
                      const IconComponent = iconType?.icon as FC<IconProps>
                      const markerKey = `${name}-${actionType}-${id}`

                      return (
                        <AdvocateHeatmapMarker
                          IconComponent={IconComponent}
                          coordinates={[0, 0]}
                          currentActionInfo={currentActionInfo}
                          handleActionMouseLeave={console.log}
                          handleActionMouseOver={console.log}
                          key={markerKey}
                        />
                      )
                    })}
                  </AnimatePresence> */}
          </>
        )}
      </Geographies>
    </ComposableMap>
  )
}
