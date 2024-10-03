import { Card } from '@/components/ui/card'

interface ResultsOverviewCardProps {
  title: string
  proCryptoCandidatesElected: number
  antiCryptoCandidatesElected: number
}

export function ResultsOverviewCard(props: ResultsOverviewCardProps) {
  const { title, proCryptoCandidatesElected, antiCryptoCandidatesElected } = props

  return (
    <Card className="max-w-xl p-8">
      <p className="text-lg font-bold">{title}</p>
      <div className="flex gap-4 text-primary-foreground ">
        <div className="max-w-60 space-y-1 rounded-xl bg-green-700 p-4">
          <p className="text-3xl font-bold">{proCryptoCandidatesElected}</p>
          <p>Pro-crypto candidates elected</p>
        </div>
        <div className="max-w-60 space-y-1 rounded-xl bg-red-700 p-4">
          <p className="text-3xl font-bold">{antiCryptoCandidatesElected}</p>
          <p>Anti-crypto candidates elected</p>
        </div>
      </div>
    </Card>
  )
}
