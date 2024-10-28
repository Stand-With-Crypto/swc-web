/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'

import { organizeRaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific/organizeRaceSpecificPeople'
import { organizeStateSpecificPeople } from '@/components/app/pageLocationKeyRaces/locationStateSpecific/organizeStateSpecificPeople'
import { DTSI_Person, DTSI_UnitedStatesPresidentialQuery } from '@/data/dtsi/generated'
import { queryDTSILocationDistrictSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationDistrictSpecificInformation'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import { formatDTSIDistrictId, NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence,
  convertDTSIPersonStanceScoreToLetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { OPEN_GRAPH_IMAGE_DIMENSIONS } from '@/utils/server/generateOpenGraphImageUrl'
import { USStateCode } from '@/utils/shared/usStateUtils'

type RaceData = {
  presidential: DTSI_UnitedStatesPresidentialQuery | null
  state: ReturnType<typeof organizeStateSpecificPeople> | null
  district: ReturnType<typeof organizeRaceSpecificPeople> | null
}

type CandidateScoreInfo = Pick<
  DTSI_Person,
  'computedStanceScore' | 'manuallyOverriddenStanceScore' | 'computedSumStanceScoreWeight'
>

const ASSET_PATHS = {
  shield: new URL('../../pagePoliticianDetails/images/shield.png', import.meta.url),
  placeholder: new URL('../../pagePoliticianDetails/images/profile.png', import.meta.url),
  grades: {
    A: new URL('../../pagePoliticianDetails/images/A.png', import.meta.url),
    B: new URL('../../pagePoliticianDetails/images/B-light.png', import.meta.url),
    C: new URL('../../pagePoliticianDetails/images/C.png', import.meta.url),
    D: new URL('../../pagePoliticianDetails/images/D-light.png', import.meta.url),
    F: new URL('../../pagePoliticianDetails/images/F.png', import.meta.url),
    unknown: new URL('../../pagePoliticianDetails/images/no-grade.png', import.meta.url),
  },
} as const

async function fetchRaceData(params: { stateCode?: string; district?: string }): Promise<RaceData> {
  const { stateCode, district } = params

  if (stateCode && district) {
    const data = await queryDTSILocationDistrictSpecificInformation({
      stateCode: stateCode as USStateCode,
      district: district as NormalizedDTSIDistrictId,
    })
    return {
      presidential: null,
      state: null,
      district: organizeRaceSpecificPeople(data.people, {
        stateCode: stateCode as USStateCode,
        district: district as NormalizedDTSIDistrictId,
      }),
    }
  }

  if (stateCode) {
    const data = await queryDTSILocationStateSpecificInformation({
      stateCode: stateCode as USStateCode,
    })
    return {
      presidential: null,
      state: organizeStateSpecificPeople(data.people),
      district: null,
    }
  }

  return {
    presidential: await queryDTSILocationUnitedStatesPresidential(),
    state: null,
    district: null,
  }
}

function selectCandidates(raceData: RaceData) {
  const { presidential, state, district } = raceData

  if (district?.length) {
    return [district[0] || null, district[1] || null]
  }

  if (state?.senators.length) {
    return [state.senators[0] || null, state.senators[1] || null]
  }

  if (presidential?.people.length) {
    const trump = presidential.people.find(candidate => candidate.lastName === 'Trump')
    const harris = presidential.people.find(candidate => candidate.lastName === 'Harris')
    return [trump || presidential.people[0] || null, harris || presidential.people[1] || null]
  }

  return [null, null]
}

function getRaceDescription(params: { stateCode?: string; district?: string }): string {
  const { stateCode, district } = params

  if (stateCode && district) {
    return `for ${stateCode.toUpperCase()} ${formatDTSIDistrictId(
      district as NormalizedDTSIDistrictId,
    )} District Congressional Race`
  }

  if (stateCode) {
    return `for U.S. Senate Race (${stateCode.toUpperCase()})`
  }

  return 'for U.S. Presidential Race'
}

async function fetchLocalAsset(url: URL): Promise<ArrayBuffer> {
  return fetch(url).then(res => res.arrayBuffer())
}

async function getLetterGradeImage(candidate: CandidateScoreInfo | null): Promise<ArrayBuffer> {
  if (!candidate) return fetchLocalAsset(ASSET_PATHS.grades.unknown)

  const grade = convertDTSIPersonStanceScoreToLetterGrade(candidate)
  const gradePath =
    ASSET_PATHS.grades[grade as keyof typeof ASSET_PATHS.grades] || ASSET_PATHS.grades.unknown
  return fetchLocalAsset(gradePath)
}

export async function generateOgImage({
  params,
}: {
  params: { stateCode?: string; district?: string }
}) {
  const raceData = await fetchRaceData(params)
  const [candidateA, candidateB] = selectCandidates(raceData)

  const [shield, placeholder, candidateAGrade, candidateBGrade] = await Promise.all([
    fetchLocalAsset(ASSET_PATHS.shield),
    fetchLocalAsset(ASSET_PATHS.placeholder),
    getLetterGradeImage(candidateA),
    getLetterGradeImage(candidateB),
  ])

  if (!candidateA && !candidateB) {
    return new ImageResponse(
      (
        <div tw="flex bg-black text-white p-8 w-full h-full flex-col items-center gap-8">
          <div tw="flex w-full flex-col justify-center items-center">
            <img
              alt="stand with crypto shield logo"
              src={shield as any}
              style={{ position: 'absolute', top: 0, right: 0 }}
              width="48px"
            />
          </div>
          <div tw="flex flex-col items-center justify-center text-center gap-2">
            <div tw="text-5xl">Who will defend crypto in America?</div>
            <div tw="text-gray-400 text-2xl">View live election results on Stand With Crypto.</div>
          </div>
        </div>
      ),
      OPEN_GRAPH_IMAGE_DIMENSIONS,
    )
  }

  return new ImageResponse(
    (
      <div
        style={{ background: '#000', gap: '2rem' }}
        tw="flex text-white p-8 w-full h-full flex-col items-center justify-center"
      >
        <img alt="stand with crypto shield logo" src={shield as any} width="48px" />

        <div tw="flex flex-col items-center text-center">
          <p tw="text-5xl font-bold mb-0">Who will defend crypto in America?</p>
          <p tw="text-3xl text-gray-400">
            View live election results {getRaceDescription(params)} on Stand With Crypto.
          </p>
        </div>

        <div style={{ gap: '4rem' }} tw="flex justify-center w-full mt-4">
          {candidateA && (
            <div tw="flex flex-col items-start text-left">
              <div tw="flex w-[175px]">
                <img
                  alt={dtsiPersonFullName(candidateA)}
                  src={candidateA.profilePictureUrl || (placeholder as any)}
                  style={{
                    display: 'flex',
                    backgroundColor: 'gray',
                    overflow: 'hidden',
                    objectFit: 'cover',
                    width: '175px',
                    height: '175px',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  tw="rounded-md"
                />
                <img
                  alt="politician stance on crypto"
                  src={candidateAGrade as any}
                  tw="-bottom-4 -right-4 absolute h-10 w-10 rounded-full"
                />
              </div>
              <div tw="flex-col mt-8 flex items-start">
                <span tw="text-2xl mb-2">
                  {dtsiPersonFullName(candidateA)}
                  {candidateA.politicalAffiliationCategory
                    ? ` (${
                        dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                          candidateA.politicalAffiliationCategory,
                        ) ?? ''
                      })`
                    : ''}
                </span>
                <span tw="text-gray-400">
                  {convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(candidateA)}
                </span>
              </div>
            </div>
          )}
          {candidateB && (
            <div tw="flex flex-col items-end text-right">
              <div tw="flex w-[175px]">
                <img
                  alt={dtsiPersonFullName(candidateB)}
                  src={candidateB.profilePictureUrl || (placeholder as any)}
                  style={{
                    display: 'flex',
                    backgroundColor: 'gray',
                    overflow: 'hidden',
                    objectFit: 'cover',
                    width: '175px',
                    height: '175px',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  tw="rounded-md"
                />
                <img
                  alt="politician stance on crypto"
                  src={candidateBGrade as any}
                  tw="-bottom-4 -right-4 absolute h-10 w-10 rounded-full"
                />
              </div>
              <div tw="flex-col mt-8 flex items-end">
                <span tw="text-2xl mb-2">
                  {dtsiPersonFullName(candidateB)}
                  {candidateB.politicalAffiliationCategory
                    ? ` (${
                        dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                          candidateB.politicalAffiliationCategory,
                        ) ?? ''
                      })`
                    : ''}
                </span>
                <span tw="text-gray-400">
                  {convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(candidateB)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    OPEN_GRAPH_IMAGE_DIMENSIONS,
  )
}
