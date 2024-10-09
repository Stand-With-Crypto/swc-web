'use client'

import { PageTitle } from '@/components/ui/pageTitleText'
import { useCookieState } from '@/hooks/useCookieState'

export const dynamic = 'error'

export const INTERNAL_API_TAMPERING_KEY_RACES_PERCENTAGE_COVERAGE =
  'INTERNAL_API_TAMPERING_KEY_RACES_PERCENTAGE_COVERAGE'

export default function ApiTamperingPage() {
  const [keyRacesPercentCoverage, setKeyRacesPercentCoverage] = useCookieState(
    INTERNAL_API_TAMPERING_KEY_RACES_PERCENTAGE_COVERAGE,
  )

  const handlePhaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyRacesPercentCoverage(event.target.value, {
      sameSite: 'strict',
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
            onClick={() => setKeyRacesPercentCoverage('')}
          >
            Remove tampering
          </button>
        </div>
        <h2 className="mb-4 text-xl font-bold">Select percentage coverage</h2>
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center space-x-3">
            <input
              checked={keyRacesPercentCoverage === '25'}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              name="electionPhase"
              onChange={handlePhaseChange}
              type="radio"
              value="25"
            />
            <span className="text-gray-700">At the Beginning 25%</span>
          </label>

          <label className="flex cursor-pointer items-center space-x-3">
            <input
              checked={keyRacesPercentCoverage === '50'}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              name="electionPhase"
              onChange={handlePhaseChange}
              type="radio"
              value="50"
            />
            <span className="text-gray-700">Throughout the day 50%</span>
          </label>

          <label className="flex cursor-pointer items-center space-x-3">
            <input
              checked={keyRacesPercentCoverage === '75'}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              name="electionPhase"
              onChange={handlePhaseChange}
              type="radio"
              value="75"
            />
            <span className="text-gray-700">Ending 75%</span>
          </label>

          <label className="flex cursor-pointer items-center space-x-3">
            <input
              checked={keyRacesPercentCoverage === '100'}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              name="electionPhase"
              onChange={handlePhaseChange}
              type="radio"
              value="100"
            />
            <span className="text-gray-700">Completed 100%</span>
          </label>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">
            {keyRacesPercentCoverage ? (
              <>
                Currently covering:{' '}
                <span className="capitalize text-blue-600">{keyRacesPercentCoverage}%</span>
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
