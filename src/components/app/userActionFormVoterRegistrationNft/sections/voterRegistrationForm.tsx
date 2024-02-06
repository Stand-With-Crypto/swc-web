import { SectionNames } from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { UserActionFormVoterRegistrationNftLayout } from '@/components/app/userActionFormVoterRegistrationNft/sections/layout'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'

const MESSAGES = {
  register: {
    title: 'Register to vote and get a free "I Registered" NFT',
    subtitle: 'Register now to be ready to vote in your state this year.',
    step2: 'Go and register to vote',
  },
  checkRegistration: {
    title: 'Check your registration and get a free "I Registered" NFT',
    subtitle: 'Check your voter registration in your state this year. ',
    step2: 'Check voter registration',
  },
} as const

interface VoterRegistrationFormProps extends UseSectionsReturn<SectionNames> {
  checkRegistration?: boolean
}

export function VoterRegistrationForm({
  checkRegistration,
  goToSection,
}: VoterRegistrationFormProps) {
  const messages = MESSAGES[checkRegistration ? 'checkRegistration' : 'register']
  return (
    <UserActionFormVoterRegistrationNftLayout>
      <UserActionFormVoterRegistrationNftLayout.Container>
        <UserActionFormVoterRegistrationNftLayout.Heading
          title={messages.title}
          subtitle={messages.subtitle}
        />
        <ol className="flex flex-col gap-2 justify-self-center">
          <li className="flex flex-row items-center gap-4 py-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M7.86 4.84003L5.54 6.36003V4.15003L8.18 2.28003H10.45V13.73H7.86V4.84003Z"
                fill="#5B616E"
              />
            </svg>
            Choose your state
          </li>
          <li className="flex flex-row items-center gap-4 py-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3.68 13.39L7.87 8.95995C8.97 7.78995 9.68 6.77995 9.68 5.73995C9.68 4.79995 9.15 4.18995 8.16 4.18995C7.15 4.18995 6.51 4.77995 6.34 6.28995H3.98C4.11 3.63995 5.71 2.19995 8.27 2.19995C10.8 2.19995 12.24 3.60995 12.24 5.66995C12.24 7.18995 11.36 8.43995 10.03 9.71995L7.87 11.83H12.32V13.8H3.68V13.39Z"
                fill="#5B616E"
              />
            </svg>
            {messages.step2}
          </li>
          <li className="flex flex-row items-center gap-4 py-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3.53 10.08H5.87C5.97 11.18 6.56 11.99 7.93 11.99C9.23 11.99 9.83 11.37 9.83 10.34C9.83 9.25 9.22 8.68999 7.99 8.68999H7.1V6.96H7.93C9.13 6.96 9.67 6.42 9.67 5.44C9.67 4.62 9.14 4.02 8.09 4.02C7 4.02 6.33 4.68 6.2 5.75H3.92C4.05 3.65 5.54 2.12 8.15 2.12C10.66 2.12 12.13 3.43 12.13 5.22C12.13 6.5 11.38 7.29999 10.24 7.7C11.57 7.99 12.46 8.93 12.46 10.39C12.46 12.54 10.81 13.9 8.03 13.9C5.12 13.89 3.63 12.4 3.53 10.08Z"
                fill="#5B616E"
              />
            </svg>
            Return here to claim your free NFT
          </li>
        </ol>
      </UserActionFormVoterRegistrationNftLayout.Container>
      <UserActionFormVoterRegistrationNftLayout.Footer>
        <Button onClick={() => goToSection(SectionNames.SUCCESS)}>Claim NFT</Button>
      </UserActionFormVoterRegistrationNftLayout.Footer>
    </UserActionFormVoterRegistrationNftLayout>
  )
}
