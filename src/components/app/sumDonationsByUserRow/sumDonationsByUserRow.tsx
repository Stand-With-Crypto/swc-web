import { UserAvatar } from '@/components/app/userAvatar'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { NextImage } from '@/components/ui/image'
import { SumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { cn } from '@/utils/web/cn'
import { getUserDisplayName } from '@/utils/web/userUtils'

interface SumDonationsRowProps {
  sumDonations: SumDonationsByUser[0]
  locale: SupportedLocale
  index: number
  overrideDonationRecipient?: string
  highlight: boolean
}

const INDEX_SHIELD_IMAGE_MAP = ['/shields/gold.svg', '/shields/silver.svg', '/shields/bronze.svg']

export function SumDonationsByUserRow({
  locale,
  sumDonations,
  index,
  overrideDonationRecipient,
  highlight,
}: SumDonationsRowProps) {
  return (
    <div
      className={cn('relative flex items-center justify-between gap-5', {
        'rounded-lg': highlight,
        'border-2': highlight,
        'border-blue-500': highlight,
        'bg-blue-50': highlight,
        'p-4': highlight,
        '-m-4': highlight,
        'font-semibold': highlight,
      })}
    >
      {highlight && (
        <div className="absolute left-0 top-0 rounded-br-[2px] rounded-tl-sm bg-blue-500  px-1 text-xs text-white">
          You
        </div>
      )}

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
          <div className="text-xs text-gray-500">
            {overrideDonationRecipient || 'Stand With Crypto'}
          </div>
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
