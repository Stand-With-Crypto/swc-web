import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { queryDTSIPresidentialCandidates } from '@/data/dtsi/queries/queryDTSIPresidentialCandidates'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

export const revalidate = 3600
export const dynamic = 'error'

// TODO metadata

export default async function PoliticiansHomepage({ params }: PageProps) {
  const [{ people }] = await Promise.all([queryDTSIPresidentialCandidates()])
  const urls = getIntlUrls(params.locale)
  return (
    <div className="mx-auto mt-10 w-full max-w-xl space-y-5 p-4">
      <h1>National political figures</h1>
      {people.map(person => (
        <DTSIPersonCard person={person} key={person.id} />
      ))}
    </div>
  )
}
