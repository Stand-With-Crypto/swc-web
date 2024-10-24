export const INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID =
  'INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID'

export interface KeyRacesMockCookie {
  estimatedVotes: string
  raceStatus: 'not-started' | 'in-progress' | 'finished'
}

export const parseKeyRacesMockCookie = (
  cookieValue: string | null | undefined,
): KeyRacesMockCookie | null => {
  if (!cookieValue) {
    return null
  }

  return cookieValue?.includes('{')
    ? (JSON.parse(cookieValue) as KeyRacesMockCookie)
    : {
        estimatedVotes: cookieValue,
        raceStatus: 'in-progress',
      }
}
