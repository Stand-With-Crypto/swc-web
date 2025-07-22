'use client'

export function PageReferralsHeading({ children }: { children: React.ReactNode }) {
  return <section className="space-y-7 text-center">{children}</section>
}

export function PageReferralsWrapper({ children }: { children: React.ReactNode }) {
  return <div className="standard-spacing-from-navbar container space-y-8">{children}</div>
}

export function PageReferrals({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

PageReferrals.Heading = PageReferralsHeading
PageReferrals.Wrapper = PageReferralsWrapper
