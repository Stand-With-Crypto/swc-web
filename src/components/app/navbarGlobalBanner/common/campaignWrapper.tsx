import { ReactNode } from 'react'

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
 *     <CampaignWrapper>
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

export function CampaignWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center bg-primary-cta px-1 py-3">
      <div className="flex h-full w-full items-center text-center">
        <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
          {children}
        </div>
      </div>
    </div>
  )
}
