import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import {
  DTSI_PresidentialCandidatesQuery,
  DTSI_PresidentialCandidatesQueryVariables,
} from '@/data/dtsi/generated'
import { queryDoTheySupportItPresidentialCandidates } from '@/data/dtsi/queries/queryDoTheySupportItPresidentialCandidates'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

export const revalidate = 3600
export const dynamic = 'error'

// TODO metadata

export default async function PoliticiansHomepage(props: PageProps) {
  const [{ people }] = await Promise.all([
    fetchDTSI<DTSI_PresidentialCandidatesQuery, DTSI_PresidentialCandidatesQueryVariables>(
      queryDoTheySupportItPresidentialCandidates,
    ),
  ])
  const urls = getIntlUrls(props.params.locale)
  return (
    <div className="mx-auto mt-10 w-full max-w-xl space-y-5 p-4">
      <h1>National political figures</h1>
      {people.map(person => (
        <DTSIPersonCard person={person} key={person.id} />
      ))}
    </div>
  )
}
