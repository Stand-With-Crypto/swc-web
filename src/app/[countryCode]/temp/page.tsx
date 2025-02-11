import { TempConnectEmbedComponent } from '@/app/[countryCode]/temp/temp-component'

export const dynamic = 'error'

export default function TempPage() {
  return (
    <div>
      <h1>Login Test</h1>

      <TempConnectEmbedComponent />
    </div>
  )
}
