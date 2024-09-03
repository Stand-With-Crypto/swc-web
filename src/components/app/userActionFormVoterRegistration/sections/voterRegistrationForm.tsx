import { Dispatch, SetStateAction, useCallback } from 'react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import {
  REGISTRATION_URLS_BY_STATE,
  RegistrationStatusAnswer,
  SectionNames,
} from '@/components/app/userActionFormVoterRegistration/constants'
import { useVoterRegistrationAction } from '@/components/app/userActionFormVoterRegistration/useVoterRegistrationAction'
import { Button } from '@/components/ui/button'
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
import { toastGenericError } from '@/utils/web/toastUtils'

const STATE_CODES = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)

const COPY: Record<
  RegistrationStatusAnswer,
  {
    title: string
    subtitle: string
    cta: string
  }
> = {
  yes: {
    title: 'Thanks for being registered!',
    subtitle: "Let's double check your information to make sure you have no issues voting.",
    cta: 'Check my registration status',
  },
  no: {
    title: 'Register to vote',
    subtitle: "You can register to vote online. It won't take more than 5 minutes.",
    cta: 'Register to vote',
  },
  'not-sure': {
    title: 'Check your registration status',
    subtitle: "Make sure you're registered to vote in your state.",
    cta: 'Check my registration status',
  },
}

const WY_DISCLAIMER =
  'Wyoming does not provide online voter registration checks. But you can still complete the action.'
const ND_DISCLAIMER =
  'North Dakota does not require voter registration. But you can still complete the action.'

function getDisclaimerByState(stateCode: USStateCode | undefined) {
  if (stateCode === 'ND') return ND_DISCLAIMER
  if (stateCode === 'WY') return WY_DISCLAIMER
  return null
}

export interface VoterRegistrationFormProps extends UseSectionsReturn<SectionNames> {
  registrationAnswer: RegistrationStatusAnswer
  stateCode?: USStateCode
  onChangeStateCode: Dispatch<SetStateAction<USStateCode | undefined>>
}

export function VoterRegistrationForm({
  registrationAnswer = 'not-sure',
  goToSection,
  goBackSection,
  stateCode,
  onChangeStateCode,
}: VoterRegistrationFormProps) {
  const { title, subtitle, cta } = COPY[registrationAnswer]
  const { createAction, isCreatingAction } = useVoterRegistrationAction()

  const link = stateCode
    ? REGISTRATION_URLS_BY_STATE[stateCode][
        registrationAnswer === 'no' ? 'registerUrl' : 'checkRegistrationUrl'
      ]
    : undefined

  const handleOnValueChange = useCallback(
    (value: string) => {
      if (STATE_CODES.includes(value)) {
        onChangeStateCode(value as USStateCode)
      }
    },
    [onChangeStateCode],
  )

  const handleClaimNft = useCallback(async () => {
    if (!stateCode || !link) {
      return toastGenericError()
    }

    void createAction({
      stateCode,
      onSuccess: () => goToSection(SectionNames.SUCCESS),
    })
    window.open(link)
  }, [createAction, goToSection, link, stateCode])

  return (
    <UserActionFormLayout onBack={goBackSection}>
      <UserActionFormLayout.Container>
        <UserActionFormLayout.Heading subtitle={subtitle} title={title} />
        <div className="mx-auto w-full max-w-64">
          <Select disabled={isCreatingAction} onValueChange={handleOnValueChange} value={stateCode}>
            <SelectTrigger className="w-full flex-shrink-0" data-testid="state-filter-trigger">
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
      </UserActionFormLayout.Container>
      <UserActionFormLayout.Footer>
        <div className="mx-auto flex w-full max-w-96 flex-col items-center gap-4">
          <p className="text-center text-sm text-fontcolor-muted">
            {getDisclaimerByState(stateCode)}
          </p>
          <Button
            className="w-full max-w-64"
            disabled={!link || isCreatingAction}
            onClick={handleClaimNft}
          >
            {isCreatingAction ? 'Loading...' : cta}
          </Button>
        </div>
      </UserActionFormLayout.Footer>
    </UserActionFormLayout>
  )
}
