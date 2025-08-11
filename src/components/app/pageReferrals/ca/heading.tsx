import { PageReferralsHeading } from '@/components/app/pageReferrals/common/heading'

interface CaPageReferralsHeadingProps {
  stateName?: string
}

export function CaPageReferralsHeading({ stateName }: CaPageReferralsHeadingProps) {
  return (
    <PageReferralsHeading
      leaderboardSubtitle={
        stateName
          ? `See which constituencies in ${stateName} have the most advocates.`
          : 'See which constituencies have the most number of Stand With Crypto advocates.'
      }
      leaderboardTitle="Constituencies Leaderboard"
      stateName={stateName}
    />
  )
}
