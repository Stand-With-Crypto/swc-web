import { PageReferralsHeading } from '@/components/app/pageReferrals/common/heading'

interface GbPageReferralsHeadingProps {
  regionName?: string
}

export function GbPageReferralsHeading({ regionName }: GbPageReferralsHeadingProps) {
  return (
    <PageReferralsHeading
      leaderboardSubtitle={
        regionName
          ? `See which constituencies in ${regionName} have the most advocates.`
          : 'See which constituencies have the most number of Stand With Crypto advocates.'
      }
      leaderboardTitle="Constituencies Leaderboard"
      stateName={regionName}
    />
  )
}
