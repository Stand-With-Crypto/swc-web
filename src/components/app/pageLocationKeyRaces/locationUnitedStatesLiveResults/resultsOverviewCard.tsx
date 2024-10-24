import { Card } from '@/components/ui/card'

interface ResultsOverviewCardProps {
  title: string
  proCryptoCandidatesElected: number
  antiCryptoCandidatesElected: number
}

export function ResultsOverviewCard(props: ResultsOverviewCardProps) {
  const { title, proCryptoCandidatesElected, antiCryptoCandidatesElected } = props

  const proCryptoCandidateText = proCryptoCandidatesElected === 1 ? 'candidate' : 'candidates'
  const antiCryptoCandidateText = antiCryptoCandidatesElected === 1 ? 'candidate' : 'candidates'

  return (
    <Card className="max-w-xl p-8">
      <p className="text-lg font-bold">{title}</p>
      <div className="flex flex-col items-center justify-center gap-4 text-primary-foreground md:flex-row ">
        <div className="max-w-60 space-y-1 rounded-xl bg-green-700 p-4">
          <p className="text-3xl font-bold">{proCryptoCandidatesElected}</p>
          <p>Pro-crypto {proCryptoCandidateText} elected</p>
        </div>
        <div className="max-w-60 space-y-1 rounded-xl bg-red-700 p-4">
          <p className="text-3xl font-bold">{antiCryptoCandidatesElected}</p>
          <p>Anti-crypto {antiCryptoCandidateText} elected</p>
        </div>
      </div>
    </Card>
  )
}
