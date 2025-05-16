import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useIsMobile } from '@/hooks/useIsMobile'
import Link from 'next/link'

export function UsCurrentNavbarGlobalBannerCampaign() {
  const isMobile = useIsMobile()
  const urls = useIntlUrls()
  const campaignUrl = urls.emailDeeplink()

  return (
    <CampaignWrapper url={campaignUrl}>
      <p>
        KEY VOTE ALERT IN THE SENATE – VOTE "YES" ON GENIUS ACT
        {isMobile ? <br /> : <span> – </span>}
        Find out more <strong>{isMobile ? 'here' : <Link href={campaignUrl}>here</Link>}</strong>
      </p>
    </CampaignWrapper>
  )
}
