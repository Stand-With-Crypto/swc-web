import { NextImage } from '@/components/ui/image'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countriesWithStateShield = [SupportedCountryCodes.US]

export function StateShield({
  state,
  countryCode,
  className,
  size = 100,
}: {
  state: string
  countryCode: SupportedCountryCodes
  className?: string
  size: number
}) {
  if (!countriesWithStateShield.includes(countryCode)) {
    return null
  }

  return (
    <NextImage
      alt={`${state} Shield`}
      className={className}
      height={size}
      src={`/stateShields/${state}.png`}
      width={size}
    />
  )
}
