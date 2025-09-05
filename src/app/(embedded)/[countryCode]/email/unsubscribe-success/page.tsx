import { AuUnsubscribeSuccessPage } from '@/components/app/pageUnsubscribe/au'
import { CaUnsubscribeSuccessPage } from '@/components/app/pageUnsubscribe/ca'
import { GbUnsubscribeSuccessPage } from '@/components/app/pageUnsubscribe/gb'
import { UsUnsubscribeSuccessPage } from '@/components/app/pageUnsubscribe/us'
import { PageProps } from '@/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const dynamic = 'error'

export default async function UnsubscribeSuccessPageRoot(props: PageProps) {
  const { countryCode } = await props.params

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return <UsUnsubscribeSuccessPage />
    case SupportedCountryCodes.AU:
      return <AuUnsubscribeSuccessPage />
    case SupportedCountryCodes.CA:
      return <CaUnsubscribeSuccessPage />
    case SupportedCountryCodes.GB:
      return <GbUnsubscribeSuccessPage />
    default:
      return gracefullyError({
        fallback: <UsUnsubscribeSuccessPage />,
        hint: {
          level: 'error',
          tags: {
            domain: 'UnsubscribeSuccessPage',
            countryCode,
          },
        },
        msg: 'Country implementation not found for UnsubscribeSuccessPage',
      })
  }
}
