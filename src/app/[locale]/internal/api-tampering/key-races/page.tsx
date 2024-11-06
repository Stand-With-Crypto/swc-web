'use client'

import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCookieState } from '@/hooks/useCookieState'
import {
  INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID,
  KeyRacesMockCookie,
  parseKeyRacesMockCookie,
} from '@/utils/shared/keyRacesTampering'

export const dynamic = 'error'

export default function ApiTamperingPage() {
  const [keyRacesMockedCookie, setKeyRacesMockedCookie] = useCookieState(
    INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID,
  )
  const cookieValue = parseKeyRacesMockCookie(keyRacesMockedCookie)

  const handleChange = useCallback(
    (key: keyof KeyRacesMockCookie) => (event: React.ChangeEvent<HTMLInputElement> | string) => {
      const value = typeof event === 'string' ? event : event.target.value

      setKeyRacesMockedCookie(
        JSON.stringify({
          ...cookieValue,
          [key]: value,
        }),
        {
          sameSite: 'strict',
          expires: 1,
        },
      )
    },
    [cookieValue, setKeyRacesMockedCookie],
  )

  return (
    <div className="container mx-auto max-w-lg space-y-16">
      <PageTitle>Api Tampering</PageTitle>

      <div className="flex flex-col gap-8 p-4">
        <Button
          className="w-fit"
          onClick={() => {
            setKeyRacesMockedCookie('', {
              sameSite: 'strict',
              expires: new Date(0),
            })
          }}
          size="lg"
          variant="secondary"
        >
          Remove tampering
        </Button>

        <h3 className="text-lg font-semibold">
          {cookieValue ? (
            <>
              Current estimated votes:{' '}
              <span className="capitalize text-blue-600">{cookieValue.estimatedVotes}</span>
            </>
          ) : (
            'Not tampered'
          )}
        </h3>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="estimatedVotesMid"
          >
            Estimated Votes
          </label>
          <Input
            id="estimatedVotesMid"
            onChange={handleChange('estimatedVotes')}
            placeholder="0"
            type="number"
            value={cookieValue?.estimatedVotes}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Race Status</label>
          <Select onValueChange={handleChange('raceStatus')} value={cookieValue?.raceStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Race Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'not-started'}>Not Started</SelectItem>
              <SelectItem value={'in-progress'}>In Progress</SelectItem>
              <SelectItem value={'finished'}>Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
