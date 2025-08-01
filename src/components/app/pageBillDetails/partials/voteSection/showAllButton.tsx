import { Button } from '@/components/ui/button'

interface ShowAllButtonProps {
  toggleShouldLimit: () => void
  isReturnMore: boolean
}

const ShowAllButton = ({ toggleShouldLimit, isReturnMore }: ShowAllButtonProps) => {
  return (
    <Button onClick={toggleShouldLimit} variant="secondary">
      {isReturnMore ? 'Show all' : 'Hide'}
    </Button>
  )
}

export default ShowAllButton
