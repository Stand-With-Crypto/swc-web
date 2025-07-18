import { useCallback, useMemo } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ClassValue } from 'clsx'

import { FormattedNumber } from '@/components/ui/formattedNumber'
import { NextImage } from '@/components/ui/image'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { cn } from '@/utils/web/cn'

interface DistrictsLeaderboardRowProps extends VariantProps<typeof rowVariants> {
  state: string
  district: string
  count: number
  rank: number
  className?: ClassValue
  locale: SupportedLocale
  countryCode: SupportedCountryCodes
}

const rowVariants = cva('flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-primary-cta/5', {
  variants: {
    variant: {
      default: '',
      highlight: 'bg-primary-cta/10 hover:bg-primary-cta/15',
    },
  },
})

function getRankIcon(rank: number) {
  if (rank === 1) {
    return <NextImage alt="1st place" height={32} src="/misc/1st-place.svg" width={32} />
  }
  if (rank === 2) {
    return <NextImage alt="2nd place" height={32} src="/misc/2nd-place.svg" width={32} />
  }
  if (rank === 3) {
    return <NextImage alt="3rd place" height={32} src="/misc/3rd-place.svg" width={32} />
  }
  return <p className="text-center font-semibold text-fontcolor-muted">{rank}</p>
}

export function DistrictsLeaderboardRow(props: DistrictsLeaderboardRowProps) {
  const { rank, state, district, count, className, variant, locale, countryCode } = props

  const getStateName = useCallback(
    (stateCode: string) => {
      if (countryCode === SupportedCountryCodes.CA) {
        return (
          CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP[stateCode as CAProvinceCode] ??
          stateCode
        )
      }

      if (countryCode === SupportedCountryCodes.AU) {
        return AU_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode as AUStateCode] ?? stateCode
      }

      return US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode as USStateCode] ?? stateCode
    },
    [countryCode],
  )

  const getFormattedDistrictName = useCallback(
    (districtName: string) => {
      if (
        [SupportedCountryCodes.CA, SupportedCountryCodes.AU, SupportedCountryCodes.GB].includes(
          countryCode,
        )
      ) {
        return ` - ${districtName}`
      }

      return ` - District ${districtName}`
    },
    [countryCode],
  )

  const shouldShowDistrict = useMemo(() => {
    if (
      [SupportedCountryCodes.CA, SupportedCountryCodes.AU, SupportedCountryCodes.GB].includes(
        countryCode,
      )
    ) {
      return !!district
    }

    return US_STATE_CODE_TO_DISTRICT_COUNT_MAP[state as USStateCode] > 0
  }, [countryCode, state, district])

  return (
    <div className={cn(rowVariants({ variant }), className)}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
        {getRankIcon(rank)}
      </div>
      <div className="font-semibold capitalize">
        <span>{getStateName(state)}</span>
        {shouldShowDistrict && <span>{getFormattedDistrictName(district)}</span>}
      </div>
      <p className="ml-auto">{isNaN(count) ? '' : FormattedNumber({ amount: count, locale })}</p>
    </div>
  )
}
