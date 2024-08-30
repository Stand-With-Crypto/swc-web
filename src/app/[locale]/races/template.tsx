import { VoterAttestationDialog } from '@/components/app/pageLocationKeyRaces/dialog'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VoterAttestationDialog />
      {children}
    </>
  )
}
