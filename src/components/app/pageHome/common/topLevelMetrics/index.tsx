'use client'
import { useMemo } from 'react'

import { TopLevelMetricsCard } from '@/components/app/pageHome/common/topLevelMetrics/card'
import { TopLevelMetricsContext } from '@/components/app/pageHome/common/topLevelMetrics/context'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface TopLevelMetricsProps
  extends Pick<
    Awaited<ReturnType<typeof getHomepageData>>,
    'countPolicymakerContacts' | 'countUsers' | 'sumDonations'
  > {
  countryCode: SupportedCountryCodes
  disableTooltips?: boolean
  useGlobalLabels?: boolean
}

function TopLevelMetricsRoot({
  children,
  countryCode,
}: {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
}) {
  return (
    <TopLevelMetricsContext.Provider value={{ countryCode }}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5">{children}</div>
    </TopLevelMetricsContext.Provider>
  )
}

function TopLevelMetricsMain({ children }: { children: React.ReactNode }) {
  return <div className="col-span-3">{children}</div>
}

function TopLevelMetricsAside({ children }: { children: React.ReactNode }) {
  return <div className="col-span-2 flex flex-col gap-2">{children}</div>
}

export function TopLevelMetrics({ countryCode, ...data }: TopLevelMetricsProps) {
  const values = useApiHomepageTopLevelMetrics({
    initial: data,
  }).data

  const policymakerContactsCount = useMemo(() => {
    return (
      values.countPolicymakerContacts.countUserActionEmailRecipients +
      values.countPolicymakerContacts.countUserActionCalls +
      values.countPolicymakerContacts.hardcodedCountSum
    )
  }, [values.countPolicymakerContacts])

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
      <div className="col-span-3">
        <TopLevelMetricsCard
          countryCode={countryCode}
          img="/actionTypeIcons/optIn.png"
          imgAlt="Email"
          label="Global crypto advocates"
          roundDownStep={100}
          value={values.countUsers.total}
          variant="main"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        {[
          {
            label: 'Global advocates',
            value: values.countUsers.total,
            roundDownStep: 100,
            img: '/actionTypeIcons/optIn.png',
            imgAlt: 'Email',
          },
          {
            label: 'Global policymaker contacts',
            value: policymakerContactsCount,
            roundDownStep: 100,
            img: '/actionTypeIcons/email.png',
            imgAlt: 'Email',
          },
          {
            label: 'Global donations',
            value: values.sumDonations.amountUsd,
            roundDownStep: 10000,
            img: '/actionTypeIcons/donate.png',
            imgAlt: 'Email',
            isCurrency: true,
          },
        ].map(({ label, value, roundDownStep, img, imgAlt, isCurrency }, index) => (
          <TopLevelMetricsCard
            countryCode={countryCode}
            img={img}
            imgAlt={imgAlt}
            isCurrency={isCurrency}
            key={index}
            label={label}
            roundDownStep={roundDownStep}
            value={value}
            variant={'secondary'}
          />
        ))}
      </div>
    </div>
  )
}

export {
  TopLevelMetricsAside as Aside,
  TopLevelMetricsCard as Card,
  TopLevelMetricsMain as Main,
  TopLevelMetricsRoot as Root,
}
