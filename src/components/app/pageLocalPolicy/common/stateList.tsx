import { InternalLink } from '@/components/ui/link'

interface State {
  code: string
  name: string
  url: string
}

interface StateListContentProps {
  states: State[]
}

export function StateList({ children }: React.PropsWithChildren) {
  return <div className="flex flex-col items-center justify-center gap-8">{children}</div>
}

function StateListTitle({ children }: React.PropsWithChildren) {
  return <h2 className="text-lg font-semibold">{children}</h2>
}
StateList.Title = StateListTitle

function StateListContent({ states }: StateListContentProps) {
  return (
    <ul className="container mx-auto mb-16 flex flex-wrap justify-center gap-x-8 gap-y-6">
      {states.map(({ code, name, url }) => (
        <li className="w-[130px] text-center" key={code}>
          <InternalLink className="text-sm font-bold text-primary-cta hover:underline" href={url}>
            {name}
          </InternalLink>
        </li>
      ))}
    </ul>
  )
}
StateList.Content = StateListContent
