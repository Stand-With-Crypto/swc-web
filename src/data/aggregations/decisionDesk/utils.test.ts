import { describe, expect, it } from '@jest/globals'

import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { CandidatesWithVote } from '@/data/aggregations/decisionDesk/types'
import { getDtsiMatchFromDdhq } from '@/data/aggregations/decisionDesk/utils'

const fakeDtsiPoliticians = [
  {
    firstName: 'Rubén',
    lastName: 'Gallego',
    firstNickname: 'Ruben',
    nameSuffix: '',
    primaryRole: {
      primaryDistrict: '3',
      primaryState: 'AZ',
    },
  },
  {
    firstName: 'Donald',
    lastName: 'Trump',
    firstNickname: '',
    nameSuffix: '',
    primaryRole: {
      primaryDistrict: '',
      primaryState: '',
    },
  },
  {
    firstName: 'Mike',
    lastName: 'Rogers',
    firstNickname: '',
    nameSuffix: '',
    primaryRole: {
      primaryDistrict: '',
      primaryState: 'MI',
    },
  },
  {
    firstName: 'Lisa',
    lastName: 'Blunt Rochester',
    firstNickname: '',
    nameSuffix: '',
    primaryRole: {
      primaryDistrict: 'At-Large',
      primaryState: 'DE',
    },
  },
  {
    firstName: 'Eleanor',
    lastName: 'Norton',
    firstNickname: '',
    nameSuffix: '',
    primaryRole: {
      primaryDistrict: 'At-Large',
      primaryState: 'DC',
    },
  },
]

describe(`Tests util's name matching for politicians between DTSI and DDHQ`, () => {
  it('should return true if the first name and last name match for Rubén Gallego', () => {
    const match = getDtsiMatchFromDdhq(
      {
        firstName: 'Rubén',
        lastName: 'Gallego',
        partyName: 'DEMOCRAT',
        state: 'AZ',
        district: '3',
      } as CandidatesWithVote,
      fakeDtsiPoliticians as DTSI_Candidate[],
    )

    expect(match).toEqual(fakeDtsiPoliticians.find(person => person.firstName === 'Rubén'))
  })

  it('should return false if the first name and last name do not match for Eleanor Holmes', () => {
    const matchFirstNameWithLastName = getDtsiMatchFromDdhq(
      {
        firstName: 'Eleanor Holmes',
        lastName: 'Norton',
        partyName: 'Democratic',
        state: 'DC',
        district: 'At-large',
      } as CandidatesWithVote,
      fakeDtsiPoliticians as DTSI_Candidate[],
    )

    const matchLastNameWith2Names = getDtsiMatchFromDdhq(
      {
        firstName: 'Eleanor',
        lastName: 'Holmes Norton',
        partyName: 'Democratic',
        state: 'DC',
        district: 'At-large',
      } as CandidatesWithVote,
      fakeDtsiPoliticians as DTSI_Candidate[],
    )

    const matchNameWithJust1Name = getDtsiMatchFromDdhq(
      {
        firstName: 'Eleanor',
        lastName: 'Norton',
        partyName: 'Democratic',
        state: 'DC',
        district: 'At-large',
      } as CandidatesWithVote,
      fakeDtsiPoliticians as DTSI_Candidate[],
    )

    expect(matchFirstNameWithLastName).toEqual(
      fakeDtsiPoliticians.find(person => person.firstName === 'Eleanor'),
    )
    expect(matchLastNameWith2Names).toEqual(
      fakeDtsiPoliticians.find(person => person.firstName === 'Eleanor'),
    )
    expect(matchNameWithJust1Name).toEqual(
      fakeDtsiPoliticians.find(person => person.firstName === 'Eleanor'),
    )
  })
})
