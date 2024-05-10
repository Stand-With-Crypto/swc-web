import { Metadata } from 'next'

import { PageTermsOfService } from '@/components/app/pageTermsOfService'
import { StaticPagesCTA } from '@/components/app/staticPagesCTA'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: 'Terms of service',
  }),
}
export default async function TermsOfServicePage() {
  return (
    <>
      <div className="standard-spacing-from-navbar container flex flex-col items-center">
        <PageTermsOfService />
      </div>
      <hr className="mt-8" />
      <div className="container mt-8 flex flex-col items-center">
        <StaticPagesCTA />
      </div>
    </>
  )
}
