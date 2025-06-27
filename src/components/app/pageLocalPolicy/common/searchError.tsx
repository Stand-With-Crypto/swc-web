import { ErrorMessage } from '@/components/ui/errorMessage'

interface SearchErrorProps {
  message: string
}

export function SearchError({ message }: SearchErrorProps) {
  return <ErrorMessage className="text-center">{message}</ErrorMessage>
}
