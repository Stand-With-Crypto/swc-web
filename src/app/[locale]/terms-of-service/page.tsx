import { TermsOfService } from '@/components/app/pageTermsOfService'
import { StaticPagesCTA } from '@/components/app/staticPagesCTA'
import { Metadata } from 'next'

export const dynamic = 'error'

export const metadata: Metadata = {
  title: 'Terms of service',
}

export default async function TermsOfServicePage() {
  return (
    <>
      <div className="container flex flex-col items-center">
        <TermsOfService />
      </div>
      <hr className="mt-8" />
      <div className="container mt-8 flex flex-col items-center">
        <StaticPagesCTA />
      </div>
    </>
  )
}
