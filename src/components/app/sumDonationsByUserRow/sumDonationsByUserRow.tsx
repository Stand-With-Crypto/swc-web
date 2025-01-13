import { isNil } from 'lodash-es'

import { UserAvatar } from '@/components/app/userAvatar'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { NextImage } from '@/components/ui/image'
import { SumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { cn } from '@/utils/web/cn'
import { getUserDisplayName } from '@/utils/web/userUtils'

interface SumDonationsRowProps {
  sumDonations: SumDonationsByUser[0]
  locale: SupportedLocale
  index: number
  overrideDonationRecipient?: string
}

const INDEX_SHIELD_IMAGE_MAP = ['/shields/gold.svg', '/shields/silver.svg', '/shields/bronze.svg']

export function SumDonationsByUserRow({ locale, sumDonations, index }: SumDonationsRowProps) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex items-center gap-2">
        <div className={cn('relative text-center', index < 1000 ? 'w-6' : 'w-8')}>
          <div className={cn('z-1', !isNil(INDEX_SHIELD_IMAGE_MAP[index]) && 'text-white')}>
            {index + 1}
          </div>
          {!isNil(INDEX_SHIELD_IMAGE_MAP[index]) && (
            <NextImage
              alt={`position ${index + 1} medal`}
              className="absolute"
              height={24}
              priority
              src={INDEX_SHIELD_IMAGE_MAP[index]}
              style={{ zIndex: -1, top: '1px' }}
              width={24}
            />
          )}
        </div>
        {/* TODO: For some reason the height of this div is 46px without this manual style. Real fix is to root cause that */}
        <div style={{ height: 40 }}>
          <UserAvatar size={40} user={sumDonations.user} />
        </div>
        <div className="font-semibold lg:text-xl">{getUserDisplayName(sumDonations.user)}</div>
      </div>
      <div className="shrink-0 text-sm lg:text-base">
        <FormattedCurrency
          amount={sumDonations.totalAmountUsd}
          currencyCode={SupportedFiatCurrencyCodes.USD}
          locale={locale}
          maximumFractionDigits={2}
        />
      </div>
    </div>
  )
}
