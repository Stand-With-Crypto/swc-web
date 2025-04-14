'use client'

import { FC, MouseEvent, useCallback, useMemo, useState } from 'react'
import { useMedia, useOrientation } from 'react-use'

import { AUMapComponent } from '@/components/app/pageAdvocatesHeatmap/au/mapComponent'
import { CA_ADVOCATES_ACTIONS } from '@/components/app/pageAdvocatesHeatmap/ca/constants'
import { CAMapComponent } from '@/components/app/pageAdvocatesHeatmap/ca/mapComponent'
import {
  ActionListItem,
  AdvocateHeatmapActionList,
} from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapActionList'
import { AdvocateHeatmapOdometer } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapOdometer'
import { TotalAdvocatesPerStateTooltip } from '@/components/app/pageAdvocatesHeatmap/common/advocatesHeatmapTooltip'
import { US_ADVOCATES_ACTIONS } from '@/components/app/pageAdvocatesHeatmap/us/constants'
import { USMapComponent } from '@/components/app/pageAdvocatesHeatmap/us/mapComponent'
import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiAdvocateMap } from '@/hooks/useApiAdvocateMap'
import { getUSStateCodeFromStateName } from '@/utils/shared/stateMappings/usStateUtils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface RenderMapProps {
  countryCode: SupportedCountryCodes
  actions: PublicRecentActivity
  countUsers: number
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
  isEmbedded?: boolean
}

export function AdvocatesHeatmap({
  countryCode,
  actions,
  countUsers,
  advocatesMapPageData,
  isEmbedded,
}: RenderMapProps) {
  const orientation = useOrientation()
  const isShort = useMedia('(max-height: 430px)', true)
  const advocatesPerState = useApiAdvocateMap(advocatesMapPageData)

  const isMobileLandscape = orientation.type.includes('landscape') && isShort

  const totalAdvocatesPerState = advocatesPerState.data.advocatesMapData.totalAdvocatesPerState

  const getTotalAdvocatesPerState = useCallback(
    (stateName: string) => {
      const stateCode = getUSStateCodeFromStateName(stateName)
      return totalAdvocatesPerState.find(total => total.state === stateCode)?.totalAdvocates
    },
    [totalAdvocatesPerState],
  )

  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  const handleStateMouseHover = useCallback((geo: any, event: MouseEvent<SVGPathElement>) => {
    const { clientX, clientY } = event
    setMousePosition({ x: clientX, y: clientY })
    setHoveredStateName(geo.properties.name)
  }, [])

  const handleStateMouseOut = useCallback(() => {
    setHoveredStateName(null)
  }, [])

  const handleClearPressedState = () => {
    setMousePosition(null)
    setHoveredStateName(null)
  }

  const actionsList = useMemo(() => getActionList(countryCode), [countryCode])

  if (advocatesPerState.isLoading || !actions) {
    return (
      <div
        className={cn(
          'flex h-full flex-col items-start py-6',
          isEmbedded
            ? 'px-2'
            : `rounded-[40px] bg-[#FBF8FF] px-12 ${isMobileLandscape ? 'py-8' : 'py-28'}`,
        )}
      >
        <div className="flex h-full w-full flex-col items-center gap-4 md:flex-row">
          <Skeleton
            childrenClassName="visible"
            className="flex h-[769px] w-full items-center justify-center bg-transparent"
          >
            <NextImage
              alt="Stand With Crypto Logo"
              height={120}
              priority
              src="/logo/shield.svg"
              width={121}
            />
          </Skeleton>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-start px-2 py-6', isEmbedded ? '' : 'gap-8')}>
      <div
        className={cn(
          'flex w-full flex-col items-start gap-4',
          isEmbedded
            ? 'md:flex-row'
            : `md:flex-column rounded-[40px] bg-[#FBF8FF] px-12 ${isMobileLandscape ? 'py-8' : 'py-12'}`,
        )}
      >
        {isEmbedded && (
          <AdvocateHeatmapActionList actionList={actionsList} isEmbedded={isEmbedded} />
        )}
        <GetMapComponent
          actions={actions}
          countryCode={countryCode}
          handleStateMouseHover={handleStateMouseHover}
          handleStateMouseOut={handleStateMouseOut}
          isEmbedded={isEmbedded}
        />
        <TotalAdvocatesPerStateTooltip
          countryCode={countryCode}
          getTotalAdvocatesPerState={getTotalAdvocatesPerState}
          handleClearPressedState={handleClearPressedState}
          hoveredStateName={hoveredStateName}
          mousePosition={mousePosition}
        />
      </div>
      <div className="mt-2 flex w-full items-center justify-end">
        {isEmbedded ? (
          <AdvocateHeatmapOdometer
            className={cn(
              'font-sans',
              isEmbedded ? 'bg-black text-white' : 'bg-inherit text-black',
            )}
            countUsers={countUsers}
            countryCode={countryCode}
          />
        ) : (
          <AdvocateHeatmapActionList actionList={actionsList} isEmbedded={isEmbedded} />
        )}
      </div>
    </div>
  )
}

function getActionList(countryCode: SupportedCountryCodes) {
  const ACTIONS_BY_COUNTRY_CODE: Record<SupportedCountryCodes, ActionListItem> = {
    [DEFAULT_SUPPORTED_COUNTRY_CODE]: US_ADVOCATES_ACTIONS,
    [SupportedCountryCodes.CA]: CA_ADVOCATES_ACTIONS,
    [SupportedCountryCodes.GB]: US_ADVOCATES_ACTIONS,
    [SupportedCountryCodes.AU]: US_ADVOCATES_ACTIONS,
  }

  return ACTIONS_BY_COUNTRY_CODE[countryCode]
}

function GetMapComponent({
  actions,
  countryCode,
  handleStateMouseHover,
  handleStateMouseOut,
  isEmbedded,
}: {
  actions: PublicRecentActivity
  countryCode: SupportedCountryCodes
  handleStateMouseHover: (geo: any, event: MouseEvent<SVGPathElement>) => void
  handleStateMouseOut: () => void
  isEmbedded?: boolean
}) {
  const MAP_COMPONENT_PER_COUNTRY_CODE: Record<
    SupportedCountryCodes,
    FC<{
      actions: PublicRecentActivity
      handleStateMouseHover: (geo: any, event: MouseEvent<SVGPathElement>) => void
      handleStateMouseOut: () => void
      isEmbedded?: boolean
    }>
  > = {
    [DEFAULT_SUPPORTED_COUNTRY_CODE]: USMapComponent,
    [SupportedCountryCodes.CA]: CAMapComponent,
    [SupportedCountryCodes.GB]: USMapComponent,
    [SupportedCountryCodes.AU]: AUMapComponent,
  }

  const CurrentMapComponent = MAP_COMPONENT_PER_COUNTRY_CODE[countryCode]

  if (!CurrentMapComponent) {
    return null
  }

  return (
    <CurrentMapComponent
      actions={actions}
      handleStateMouseHover={handleStateMouseHover}
      handleStateMouseOut={handleStateMouseOut}
      isEmbedded={isEmbedded}
    />
  )
}
