import { Clock } from 'lucide-react'
import { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { externalUrls } from '@/utils/shared/urls'

export const dynamic = 'error'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: 'Questionnaire',
  }),
}

export default async function QuestionnairePage() {
  return (
    <div className="standard-spacing-from-navbar container flex flex-col items-center space-y-20">
      <div className="relative h-[180px] w-full md:h-[300px]">
        <NextImage
          alt="Stand With Crypto shield with black background"
          fill
          priority
          sizes="(max-width: 768px) 562px, 300px"
          src="/logo/shield-black-bg.svg"
        />
      </div>

      <div className="space-y-6">
        <PageTitle>Stand With Crypto Questionnaire</PageTitle>
        <PageSubTitle>
          Stand With Crypto advocates for clear, common-sense regulation, prioritizing consumer
          protection in the crypto industry. We’re mobilizing the 52 million crypto owners in the US
          – a demographic that is younger (60% Gen-Z and Millennials) and more diverse (41% identify
          as racial minorities) than the general US population – to unlock crypto’s innovation
          potential and foster greater economic freedom. Crypto is pivotal for America as an
          innovation driver ushering in web3; it's crucial for job creation, talent retention, and
          ensuring global leadership. Recognizing crypto as a national priority, akin to
          semiconductor manufacturing, we strive to ensure the United States maintains its global
          leadership as the financial system adapts.
        </PageSubTitle>
      </div>

      <div className="space-y-6">
        <Button asChild size="lg">
          <ExternalLink href={externalUrls.swcQuestionnaire()}>
            Proceed to questionnaire
          </ExternalLink>
        </Button>
        <div className="flex items-center justify-center gap-[7px] text-muted-foreground">
          <Clock size={16} />
          <p>2-3 minutes</p>
        </div>
      </div>
    </div>
  )
}
