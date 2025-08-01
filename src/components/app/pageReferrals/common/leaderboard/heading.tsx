export function LeaderboardHeading({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between">{children}</div>
}

function LeaderboardHeadingTitle({ children }: { children: React.ReactNode }) {
  return <p className="pl-4 text-lg font-bold">{children}</p>
}

function LeaderboardHeadingSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="text-fontcolor-muted">{children}</p>
}

LeaderboardHeading.Title = LeaderboardHeadingTitle
LeaderboardHeading.Subtitle = LeaderboardHeadingSubtitle
