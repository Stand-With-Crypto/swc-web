'use client'

import { PageTitle } from '@/components/ui/pageTitleText'
import { useCookieState } from '@/hooks/useCookieState'

export const dynamic = 'error'

export const INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID =
  'INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID'

export default function ApiTamperingPage() {
  const [keyRacesEstimatedVotesMid, setKeyRacesEstimatedVotesMid] = useCookieState(
    INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID,
  )

  const handleEstimatedVotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '')

    setKeyRacesEstimatedVotesMid(value, {
      sameSite: 'strict',
      expires: 1,
    })
  }

  return (
    <div className="container mx-auto max-w-lg space-y-16">
      <PageTitle>Api Tampering</PageTitle>

      <div className="flex flex-col items-center p-4">
        <h2 className="mb-4 text-xl font-bold">Remove tampering</h2>
        <div className="space-y-4">
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white"
            onClick={() => {
              setKeyRacesEstimatedVotesMid('', {
                sameSite: 'strict',
                expires: new Date(0),
              })
            }}
          >
            Remove tampering
          </button>
        </div>
        <h2 className="mb-4 text-xl font-bold">Select percentage coverage</h2>
        <div className="space-y-4">
          <div className="mb-4">
            <label htmlFor="estimatedVotesMid" className="block text-sm font-medium text-gray-700">
              Enter Estimated Votes (Mid)
            </label>
            <input
              type="number"
              id="estimatedVotesMid"
              value={keyRacesEstimatedVotesMid}
              onChange={handleEstimatedVotesChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Enter estimated number of votes (mid)"
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">
            {keyRacesEstimatedVotesMid ? (
              <>
                Current estimated votes (mid):{' '}
                <span className="capitalize text-blue-600">{keyRacesEstimatedVotesMid}</span>
              </>
            ) : (
              'Not tampered'
            )}
          </h3>
        </div>
      </div>
    </div>
  )
}
