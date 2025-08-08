import { PageReferralsHeading } from '@/components/app/pageReferrals/common/heading'

interface UsPageReferralsHeadingProps {
  stateName?: string
}

export function UsPageReferralsHeading({ stateName }: UsPageReferralsHeadingProps) {
  return (
    <PageReferralsHeading
      leaderboardSubtitle={
        stateName
          ? `See which districts in ${stateName} have the most advocates.`
          : 'See which districts have the most number of Stand With Crypto advocates.'
      }
      leaderboardTitle="District Leaderboard"
      stateName={stateName}
    />
  )
}
