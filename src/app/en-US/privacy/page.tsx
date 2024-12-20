import { Metadata } from 'next'

import { PagePrivacyPolicy } from '@/components/app/pagePrivacyPolicy'
import { StaticPagesCTA } from '@/components/app/staticPagesCTA'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: 'Privacy Policy',
  }),
}

export default async function TermsOfServicePage() {
  return (
    <>
      <div className="standard-spacing-from-navbar container flex flex-col items-center">
        <PagePrivacyPolicy />
      </div>
      <hr className="mt-8" />
      <div className="container mt-8 flex flex-col items-center">
        <StaticPagesCTA />
      </div>
    </>
  )
}
