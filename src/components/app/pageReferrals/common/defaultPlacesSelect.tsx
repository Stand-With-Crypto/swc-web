import { LeaderboardHeading } from '@/components/app/pageReferrals/common/leaderboard/heading'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { Skeleton } from '@/components/ui/skeleton'

export type DefaultPlacesSelectProps = Pick<
  GooglePlacesSelectProps,
  'onChange' | 'value' | 'loading' | 'disabled'
> & {
  title: string
  placeholder: string
}

export function DefaultPlacesSelect({ title, placeholder, ...props }: DefaultPlacesSelectProps) {
  return (
    <div className="w-full space-y-3">
      <LeaderboardHeading.Title>{title}</LeaderboardHeading.Title>
      <GooglePlacesSelect
        className="rounded-full bg-gray-100 text-gray-600"
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}

function DefaultPlacesSelectLoading() {
  return <Skeleton className="h-12 w-full bg-primary-cta/10" />
}

DefaultPlacesSelect.Loading = DefaultPlacesSelectLoading
