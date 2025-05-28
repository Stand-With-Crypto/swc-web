import { Header } from '@/components/app/pageLocalPolicy/common/header'

const STATE_SEARCH_TITLE = 'Explore local policy'
const STATE_SEARCH_SUBTITLE =
  'View bills, local elections, and find out where politicians in your state stand on crypto'

export function UsHeader() {
  return (
    <Header>
      <Header.Title>{STATE_SEARCH_TITLE}</Header.Title>
      <Header.SubTitle>{STATE_SEARCH_SUBTITLE}</Header.SubTitle>
    </Header>
  )
}
