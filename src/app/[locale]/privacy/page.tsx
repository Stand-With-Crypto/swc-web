import { PagePrivacyPolicy } from '@/components/app/pagePrivacyPolicy'
import { StaticPagesCTA } from '@/components/app/staticPagesCTA'
import { Metadata } from 'next'

export const dynamic = 'error'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default async function TermsOfServicePage() {
  return (
    <>
      <div className="container flex flex-col items-center">
        <PagePrivacyPolicy />
      </div>
      <hr className="mt-8" />
      <div className="container mt-8 flex flex-col items-center">
        <StaticPagesCTA />
      </div>
    </>
  )
}
