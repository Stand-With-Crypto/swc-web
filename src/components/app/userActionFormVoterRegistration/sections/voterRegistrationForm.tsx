import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import {
  REGISTRATION_URLS_BY_STATE,
  SectionNames,
} from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UseSectionsReturn } from '@/hooks/useSections'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/usStateUtils'

const STATE_CODES = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)

const COPY = {
  register: {
    title: "Register to vote and get a free “I'm a Voter” NFT",
    subtitle: 'Register now to be ready to vote in your state this year.',
    step2: 'Go and register to vote',
    step2Cta: 'Register',
  },
  checkRegistration: {
    title: "Check your registration and get a free “I'm a Voter” NFT",
    subtitle: 'Check your voter registration in your state this year.',
    step2: 'Check voter registration',
    step2Cta: 'Check',
  },
} as const

const WY_DISCLAIMER =
  'Wyoming does not provide online voter registration checks. But you can still get the free NFT.'
const ND_DISCLAIMER =
  'North Dakota does not require voter registration. But you can still get the free NFT.'

const LIST_ITEM_STYLE = 'flex flex-row items-center gap-4 py-4'

function Step1Svg() {
  return (
    <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.86 4.84003L5.54 6.36003V4.15003L8.18 2.28003H10.45V13.73H7.86V4.84003Z"
        fill="#5B616E"
      />
    </svg>
  )
}

function Step2Svg() {
  return (
    <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.68 13.39L7.87 8.95995C8.97 7.78995 9.68 6.77995 9.68 5.73995C9.68 4.79995 9.15 4.18995 8.16 4.18995C7.15 4.18995 6.51 4.77995 6.34 6.28995H3.98C4.11 3.63995 5.71 2.19995 8.27 2.19995C10.8 2.19995 12.24 3.60995 12.24 5.66995C12.24 7.18995 11.36 8.43995 10.03 9.71995L7.87 11.83H12.32V13.8H3.68V13.39Z"
        fill="#5B616E"
      />
    </svg>
  )
}

function Step3Svg() {
  return (
    <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.53 10.08H5.87C5.97 11.18 6.56 11.99 7.93 11.99C9.23 11.99 9.83 11.37 9.83 10.34C9.83 9.25 9.22 8.68999 7.99 8.68999H7.1V6.96H7.93C9.13 6.96 9.67 6.42 9.67 5.44C9.67 4.62 9.14 4.02 8.09 4.02C7 4.02 6.33 4.68 6.2 5.75H3.92C4.05 3.65 5.54 2.12 8.15 2.12C10.66 2.12 12.13 3.43 12.13 5.22C12.13 6.5 11.38 7.29999 10.24 7.7C11.57 7.99 12.46 8.93 12.46 10.39C12.46 12.54 10.81 13.9 8.03 13.9C5.12 13.89 3.63 12.4 3.53 10.08Z"
        fill="#5B616E"
      />
    </svg>
  )
}

function disclaimer(stateCode: USStateCode | undefined) {
  if (stateCode === 'ND') return ND_DISCLAIMER
  if (stateCode === 'WY') return WY_DISCLAIMER
  return 'Complete registration at step 2 to claim NFT'
}

interface VoterRegistrationFormProps extends UseSectionsReturn<SectionNames> {
  checkRegistration?: boolean
  stateCode?: USStateCode
  setStateCode: Dispatch<SetStateAction<USStateCode | undefined>>
}

export function VoterRegistrationForm({
  checkRegistration,
  goToSection,
  stateCode,
  setStateCode,
}: VoterRegistrationFormProps) {
  const [completeStep2, setCompleteStep2] = useState(false)

  const { title, subtitle, step2, step2Cta } = useMemo(
    () => COPY[checkRegistration ? 'checkRegistration' : 'register'],
    [checkRegistration],
  )

  const link = stateCode
    ? REGISTRATION_URLS_BY_STATE[stateCode][
        checkRegistration ? 'checkRegistrationUrl' : 'registerUrl'
      ]
    : undefined

  const handleOnValueChange = useCallback(
    (value: string) => {
      if (STATE_CODES.includes(value)) {
        setCompleteStep2(false)
        setStateCode(value as USStateCode)
      }
    },
    [setStateCode],
  )

  const handleStep2Cta = useCallback(() => {
    setCompleteStep2(true)
  }, [])

  const handleClaimNft = useCallback(async () => {
    if (!stateCode) return

    goToSection(SectionNames.CLAIM_NFT)
  }, [goToSection, stateCode])

  const handleOnBack = useCallback(() => goToSection(SectionNames.SURVEY), [goToSection])

  return (
    <UserActionFormLayout onBack={handleOnBack}>
      <UserActionFormLayout.Container>
        <UserActionFormLayout.Heading subtitle={subtitle} title={title} />
        <ol className="flex flex-col justify-self-center">
          <li className={LIST_ITEM_STYLE}>
            <Step1Svg />
            <div className="flex flex-grow flex-row items-center justify-between gap-2">
              Choose your state
              <Select onValueChange={handleOnValueChange} value={stateCode}>
                <SelectTrigger
                  className="w-[195px] flex-shrink-0"
                  data-testid="state-filter-trigger"
                >
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(([key]) => (
                    <SelectItem key={key} value={key}>
                      {getUSStateNameFromStateCode(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </li>
          <div className={stateCode === 'ND' || stateCode === 'WY' ? 'invisible' : ''}>
            <li className={LIST_ITEM_STYLE}>
              <Step2Svg />
              <div className="flex flex-grow flex-row items-center justify-between gap-2">
                {step2}
                <Button asChild disabled={!link} onClick={handleStep2Cta} variant="secondary">
                  <ExternalLink href={link}>
                    <div className="flex flex-row items-center justify-center gap-2">
                      {step2Cta} <ArrowUpRight />
                    </div>
                  </ExternalLink>
                </Button>
              </div>
            </li>
            <li className={LIST_ITEM_STYLE}>
              <Step3Svg />
              Return here to claim your free NFT
            </li>
          </div>
        </ol>
      </UserActionFormLayout.Container>
      <UserActionFormLayout.Footer>
        <div className="flex flex-grow flex-row items-center justify-between gap-8">
          <span className="w-2/3 text-sm text-fontcolor-muted">{disclaimer(stateCode)}</span>
          <Button
            disabled={stateCode !== 'WY' && stateCode !== 'ND' && !completeStep2}
            onClick={handleClaimNft}
          >
            Claim NFT
          </Button>
        </div>
      </UserActionFormLayout.Footer>
    </UserActionFormLayout>
  )
}
