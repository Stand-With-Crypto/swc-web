interface LocationNotFoundProps {
  children: React.ReactNode
}

export function YourLocale(props: LocationNotFoundProps) {
  const { children } = props

  return <div className="space-y-3">{children}</div>
}

export function YourLocaleLabel({ children }: { children: React.ReactNode }) {
  return <p className="pl-4 text-sm text-fontcolor-muted">{children}</p>
}

YourLocale.Label = YourLocaleLabel
