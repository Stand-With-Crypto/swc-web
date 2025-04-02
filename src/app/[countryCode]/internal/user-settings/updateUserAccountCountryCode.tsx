import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { actionUpdateUserCountryCode } from '@/actions/actionUpdateUserCountryCode'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSession } from '@/hooks/useSession'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export function UpdateUserAccountCountryCode() {
  const router = useRouter()
  const { isLoggedIn, user } = useSession()

  const handleCountryCodeSubmit = async (countryCode: SupportedCountryCodes) => {
    const result = await actionUpdateUserCountryCode(
      countryCode.toLowerCase() as SupportedCountryCodes,
    )

    if (result?.errors) {
      const [errorMessage] = result.errors.countryCode ?? ['Unknown error']

      toast.warning(`Cookie was updated successfully. ${errorMessage}`, {
        duration: 2000,
      })
    }

    router.refresh()
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <strong>User Country Code</strong>

      {isLoggedIn ? (
        <Select
          onValueChange={async value => {
            await handleCountryCodeSubmit(value as SupportedCountryCodes)
          }}
          value={user?.countryCode}
        >
          <SelectTrigger className="w-[195px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDERED_SUPPORTED_COUNTRIES.map(country => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p>You need to be logged in first!</p>
      )}

      <p className="text-sm text-muted-foreground">
        Updating this will update the countryCode associated with the current logged in user. This
        is helpful to update the country code without needing to change the address in the profile
        page
      </p>
    </div>
  )
}
