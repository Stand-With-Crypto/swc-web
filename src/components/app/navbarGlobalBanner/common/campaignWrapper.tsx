import { ReactNode } from 'react'
import Link from 'next/link'

import { useIsMobile } from '@/hooks/useIsMobile'

/**
 * Example usage of the campaign component:
 *
 * @example
 * function USCampaign() {
 *   const isMobile = useIsMobile();
 *   const urls = useIntlUrls();
 *   const campaignUrl = urls.emailDeeplink();
 *
 *   return (
 *     <CampaignWrapper url={campaignUrl}>
 *       <p>
 *         KEY VOTE ALERT IN THE HOUSE – VOTE "YES" ON H.J.RES.25
 *         {isMobile ? <br /> : <span> – </span>}
 *         Find out more{' '}
 *         <strong>
 *           {isMobile ? (
 *             'here'
 *           ) : (
 *             <Link href={campaignUrl}>here</Link>
 *           )}
 *         </strong>
 *       </p>
 *     </CampaignWrapper>
 *   );
 * }
 */

export function CampaignWrapper({ children, url }: { children: ReactNode; url: string }) {
  return (
    <div className="flex w-full items-center justify-center bg-primary-cta px-1 py-3">
      <MobileLinkWrapper url={url}>
        <div className="container flex justify-between">
          <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
            {children}
          </div>
        </div>
      </MobileLinkWrapper>
    </div>
  )
}

function MobileLinkWrapper({ url, children }: { url: string; children: React.ReactNode }) {
  const isMobile = useIsMobile()

  const className = 'flex h-full w-full items-center text-center'
  if (isMobile) {
    return (
      <Link className={className} href={url}>
        {children}
      </Link>
    )
  }

  return <div className={className}>{children}</div>
}
