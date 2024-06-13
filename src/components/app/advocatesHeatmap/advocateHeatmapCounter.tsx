import { useMemo } from 'react'

import { TotalAdvocatesProps } from '@/components/app/advocatesHeatmap/advocatesHeatmap.types'
import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import odometerStyles from '@/components/ui/animatedNumericOdometer/odometer.module.css'
import { roundDownNumberToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import {
  getHomepageData,
  GetHomepageTopLevelMetricsResponse,
} from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { SupportedLocale } from '@/intl/locales'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

const mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease = (
  initial: Omit<TotalAdvocatesProps, 'locale' | 'sumDonations' | 'countPolicymakerContacts'>,
): Omit<TotalAdvocatesProps, 'locale' | 'sumDonations' | 'countPolicymakerContacts'> => ({
  countUsers: {
    count: roundDownNumberToAnimateIn(initial.countUsers.count, 100),
  },
})

export function AdvocateHeatmapCounter({
  locale,
  homepageData,
}: {
  locale: SupportedLocale
  homepageData: Awaited<ReturnType<typeof getHomepageData>>
}) {
  const decreasedInitialValues = useMemo(
    () => mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease(homepageData),
    [homepageData],
  )
  const values = useApiHomepageTopLevelMetrics(
    decreasedInitialValues as GetHomepageTopLevelMetricsResponse,
  ).data
  const formatted = useMemo(() => {
    return {
      countUsers: {
        count: intlNumberFormat(locale).format(values.countUsers.count),
      },
    }
  }, [values, locale])

  return (
    <div className="flex-shrink-0 rounded-3xl bg-secondary px-0 py-4 text-center md:w-1/2 md:p-6 md:py-6">
      <AnimatedNumericOdometer
        className={odometerStyles.odometerSatoshi}
        size={76}
        value={formatted.countUsers.count}
      />
      <div className="font-sans text-black">Crypto advocates in America</div>
    </div>
  )
}
