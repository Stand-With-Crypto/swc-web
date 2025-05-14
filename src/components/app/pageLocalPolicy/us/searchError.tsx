import { SearchError } from '@/components/app/pageLocalPolicy/common/searchError'
import { SearchErrorMap, SearchErrorCode } from '@/components/app/pageLocalPolicy/common/types'

const errorMap: SearchErrorMap = {
  COUNTRY_NOT_SUPPORTED: 'Sorry, we do not support this country yet.',
  STATE_NOT_FOUND: 'Sorry, we could not find a state for this address.',
}

interface UsSearchErrorProps {
  code: SearchErrorCode
}

export function UsSearchError({ code }: UsSearchErrorProps) {
  return code && <SearchError message={errorMap[code]} />
}
