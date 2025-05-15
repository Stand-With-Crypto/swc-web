import { SearchError } from '@/components/app/pageLocalPolicy/common/searchError'
import { SearchErrorCode, SearchErrorMap } from '@/components/app/pageLocalPolicy/common/types'

const errorMap: SearchErrorMap = {
  COUNTRY_NOT_SUPPORTED: 'This address is not in the US.',
  STATE_NOT_FOUND: 'We could not find a state in the US for this address.',
}

interface UsSearchErrorProps {
  code: SearchErrorCode
}

export function UsSearchError({ code }: UsSearchErrorProps) {
  return code && <SearchError message={errorMap[code]} />
}
