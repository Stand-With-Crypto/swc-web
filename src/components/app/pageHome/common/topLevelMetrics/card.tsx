'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import Image from 'next/image'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { roundDownNumberToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/utils/shared/formatCurrency'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'
import { useIsMobile } from '@/hooks/useIsMobile'

type Variant = 'main' | 'secondary'

interface Props {
  variant: Variant
  img: string
  imgAlt: string
  label: string
  tooltipContent?: string
  value: number
  countryCode: SupportedCountryCodes
  roundDownStep?: number
  isCurrency?: boolean
  imgSize?: number
}

const ODOMETER_SIZE_BY_VARIANT: Record<Variant, number> = {
  main: 60,
  secondary: 30,
} as const

export function TopLevelMetricsCard({
  variant,
  img,
  imgAlt,
  value,
  countryCode,
  label,
  tooltipContent,
  roundDownStep = 100,
  isCurrency = false,
  imgSize: overrideImgSize,
}: Props) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const isMobile = useIsMobile()

  const decreasedInitialValue = useMemo(() => {
    if (value !== undefined) {
      return roundDownNumberToAnimateIn(value, roundDownStep)
    }
    return value
  }, [value, roundDownStep])

  const [animatedValue, setAnimatedValue] = useState(decreasedInitialValue)

  const formatNumber = useCallback(
    (value: number) => {
      return intlNumberFormat(COUNTRY_CODE_TO_LOCALE[countryCode]).format(value)
    },
    [countryCode],
  )

  const formatValue = isCurrency
    ? (value: number) =>
        formatCurrency(value, {
          locale: COUNTRY_CODE_TO_LOCALE[countryCode],
          maximumFractionDigits: 0,
          notation: 'standard',
        })
    : formatNumber

  useEffect(() => {
    if (value !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedValue(value)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [value])

  const displayValue = useMemo(() => {
    if (value !== undefined && formatValue && animatedValue !== undefined) {
      return formatValue(animatedValue)
    }
    return String(value)
  }, [value, formatValue, animatedValue])

  const imgSizeMobile = overrideImgSize ?? 80
  const imageSize = isMobile ? imgSizeMobile : (overrideImgSize ?? (variant === 'main' ? 128 : 80))

  return (
    <div
      className={cn('relative flex w-full rounded-3xl bg-secondary', {
        'h-max items-center justify-start gap-6 p-6': variant === 'secondary',
        'h-full w-full flex-col items-center justify-center p-8': variant === 'main',
      })}
    >
      {tooltipContent && (
        <TooltipProvider delayDuration={0}>
          <Tooltip onOpenChange={setIsTooltipOpen} open={isTooltipOpen}>
            <TooltipTrigger
              className="absolute right-4 top-4 mx-auto flex gap-1"
              onClick={() => setIsTooltipOpen(true)}
              style={{ height: 35 }}
            >
              <Info className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs" side="bottom">
              <p className="text-sm font-normal tracking-normal">{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Image
        alt={imgAlt}
        className={cn({
          'mb-2': variant === 'main',
        })}
        height={imageSize}
        src={img}
        width={imageSize}
      />
      <div
        className={cn('flex flex-col items-center justify-center', {
          'items-start': variant === 'secondary',
        })}
      >
        {typeof displayValue === 'string' ? (
          <AnimatedNumericOdometer size={ODOMETER_SIZE_BY_VARIANT[variant]} value={displayValue} />
        ) : (
          displayValue
        )}
        <div className="text-gray-500">{label}</div>
      </div>
    </div>
  )
}
