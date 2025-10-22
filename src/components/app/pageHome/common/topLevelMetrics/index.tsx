'use client'

import { TopLevelMetricsCard } from '@/components/app/pageHome/common/topLevelMetrics/card'
import { TopLevelMetricsContext } from '@/components/app/pageHome/common/topLevelMetrics/context'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

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

function TopLevelMetricsSplit({ children }: { children: React.ReactNode }) {
  return <div className="col-span-5 flex w-full gap-2">{children}</div>
}

function TopLevelMetricsAside({ children }: { children: React.ReactNode }) {
  return <div className="col-span-2 flex flex-col gap-2">{children}</div>
}

export {
  TopLevelMetricsAside as Aside,
  TopLevelMetricsCard as Card,
  TopLevelMetricsMain as Main,
  TopLevelMetricsRoot as Root,
  TopLevelMetricsSplit as Split,
}
