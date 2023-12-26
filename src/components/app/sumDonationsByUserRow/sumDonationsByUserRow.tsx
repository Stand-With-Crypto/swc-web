import { UserAvatar } from '@/components/app/userAvatar'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { NextImage } from '@/components/ui/image'
import { SumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { getUserDisplayName } from '@/utils/web/userUtils'

interface SumDonationsRowProps {
  sumDonations: SumDonationsByUser[0]
  locale: SupportedLocale
  index: number
}

const INDEX_SHIELD_IMAGE_MAP = ['/shields/gold.svg', '/shields/silver.svg', '/shields/bronze.svg']

export function SumDonationsByUserRow({ locale, sumDonations, index }: SumDonationsRowProps) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex items-center gap-2">
        <div className="w-5">
          {INDEX_SHIELD_IMAGE_MAP[index] ? (
            <NextImage
              width={20}
              height={20}
              src={INDEX_SHIELD_IMAGE_MAP[index]}
              alt={`${index + 1}`}
            />
          ) : (
            index + 1
          )}
        </div>
        <div>
          <UserAvatar size={30} user={sumDonations.user} />
        </div>
        <div>
          <div>{getUserDisplayName(sumDonations.user)}</div>
          <div className="text-xs text-gray-500">Stand With Crypto</div>
        </div>
      </div>
      <div className="shrink-0 text-sm">
        <FormattedCurrency
          amount={sumDonations.totalAmountUsd}
          locale={locale}
          maximumFractionDigits={0}
          currencyCode={SupportedFiatCurrencyCodes.USD}
        />
      </div>
    </div>
  )
}
