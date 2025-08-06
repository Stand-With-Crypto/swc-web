import { LeaderboardHeading } from '@/components/app/pageReferrals/common/leaderboard/heading'
import { LeaderboardRow } from '@/components/app/pageReferrals/common/leaderboard/row'

export function AdvocatesLeaderboard({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 md:space-y-4">{children}</div>
}

AdvocatesLeaderboard.Heading = LeaderboardHeading
AdvocatesLeaderboard.Row = LeaderboardRow
