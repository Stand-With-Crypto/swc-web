import 'server-only'

import React from 'react'
import { X } from 'lucide-react'

import { PageHome } from '@/components/app/pageHome'
import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'
import { getSectionContent } from '@/utils/server/builder/models/sections/utils/getSectionContent'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface HomepageDialogDeeplinkLayoutProps extends React.PropsWithChildren {
  size?: 'sm' | 'md'
  pageParams: Awaited<PageProps['params']>
  hideModal?: boolean
  dialogContentClassName?: string
}

export async function HomepageDialogDeeplinkLayout({
  children,
  size = 'md',
  pageParams,
  dialogContentClassName,
}: HomepageDialogDeeplinkLayoutProps) {
  const urls = getIntlUrls(pageParams.locale)
  const [{ sumDonations, countUsers, countPolicymakerContacts }] = await Promise.all([
    getHomepageTopLevelMetrics(),
  ])
  const advocatePerStateDataProps = await getAdvocatesMapData()
  const homeHeroImageContent = await getSectionContent(
    BuilderSectionModelIdentifiers.HERO_IMAGE,
    '/',
  )
  const homeHeroTextContent = await getSectionContent(BuilderSectionModelIdentifiers.HERO_TEXT, '/')

  return (
    <>
      <InternalLink
        className={cn(dialogOverlayStyles, 'cursor-default')}
        href={urls.home()}
        replace
      />
      <div
        className={cn(
          dialogContentStyles,
          size === 'md' && 'max-w-3xl',
          'min-h-[400px]',
          dialogContentClassName,
        )}
      >
        <ScrollArea className="overflow-auto md:max-h-[90vh]">{children}</ScrollArea>
        <InternalLink className={dialogCloseStyles} href={urls.home()} replace>
          <X size={20} />
          <span className="sr-only">Close</span>
        </InternalLink>
      </div>

      <PageHome
        actions={[]}
        dtsiHomepagePeople={{ lowestScores: [], highestScores: [] }}
        params={pageParams}
        sumDonationsByUser={[]}
        {...{
          sumDonations,
          countUsers,
          countPolicymakerContacts,
        }}
        advocatePerStateDataProps={advocatePerStateDataProps}
        homeHeroImageContent={homeHeroImageContent}
        homeHeroTextContent={homeHeroTextContent}
      />
    </>
  )
}
