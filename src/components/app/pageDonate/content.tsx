import { Heading } from './heading'
import { FAQ } from './faq'
import { CTAs } from './ctas'
import { PageDonateProps } from './pageDonate.types'

export function DonatePageContent(props: PageDonateProps) {
  return (
    <div className="container space-y-24">
      <Heading {...props} />
      <FAQ />
      <CTAs />
    </div>
  )
}
