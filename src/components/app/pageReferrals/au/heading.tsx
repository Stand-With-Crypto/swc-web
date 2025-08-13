import { PageReferralsHeading } from '@/components/app/pageReferrals/common/heading'

interface AuPageReferralsHeadingProps {
  stateName?: string
}

export function AuPageReferralsHeading({ stateName }: AuPageReferralsHeadingProps) {
  return (
    <PageReferralsHeading
      leaderboardSubtitle={
        stateName
          ? `See which divisions in ${stateName} have the most advocates.`
          : 'See which divisions have the most number of Stand With Crypto advocates.'
      }
      leaderboardTitle="Divisions Leaderboard"
      stateName={stateName}
    />
  )
}
