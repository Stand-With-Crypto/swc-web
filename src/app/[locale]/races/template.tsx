import { CallForVoterAttestationDialog } from '@/components/app/pageLocationKeyRaces/callForVoterDialog'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CallForVoterAttestationDialog />
      {children}
    </>
  )
}
