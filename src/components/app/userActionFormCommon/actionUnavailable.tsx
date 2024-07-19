import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

interface UserActionFormActionUnavailableProps {
  onConfirm: () => void
}

export const UserActionFormActionUnavailable = (props: UserActionFormActionUnavailableProps) => {
  const { onConfirm } = props

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center space-y-8">
      <PageTitle size="sm">Action unavailable</PageTitle>
      <PageSubTitle>
        We've detected that you may not be located in the United States. Certain actions and tools
        on SWC are intended only for American advocates.
      </PageSubTitle>
      <Button asChild onClick={onConfirm}>
        <InternalLink href="/">Back to Home</InternalLink>
      </Button>
    </div>
  )
}
