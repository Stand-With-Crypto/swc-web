import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { ConnectionMethodsContainer } from '@/components/app/accountAuth/connectionMethodsContainer'

export default function Loading() {
  return (
    <>
      <LoadingOverlay />
      <ConnectionMethodsContainer />
    </>
  )
}
