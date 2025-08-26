import { Button } from '@/components/ui/button'

interface ShowAllButtonProps {
  toggleExpanded: () => void
  isShowingAll: boolean
}

export const ShowAllButton = ({ toggleExpanded, isShowingAll }: ShowAllButtonProps) => {
  return (
    <Button onClick={toggleExpanded} variant="secondary">
      {isShowingAll ? 'Hide' : 'Show all'}
    </Button>
  )
}
