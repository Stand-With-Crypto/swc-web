import { SearchError, SearchErrorMessageProps } from '@/components/app/pageLocalPolicy/types'
import { ErrorMessage } from '@/components/ui/errorMessage'

const errorMap: Record<NonNullable<SearchError>, string> = {
  COUNTRY_NOT_SUPPORTED: 'Sorry, we do not support this country yet.',
  STATE_NOT_FOUND: 'Sorry, we could not find a state for this address.',
}

export function SearchErrorMessage({ error }: SearchErrorMessageProps) {
  const errorMessage = errorMap[error]

  return <ErrorMessage className="text-center">{errorMessage}</ErrorMessage>
}
