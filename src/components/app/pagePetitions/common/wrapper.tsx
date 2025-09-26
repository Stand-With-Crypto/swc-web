export function PetitionsWrapper({ children }: { children: React.ReactNode }) {
  return <div className="standard-spacing-from-navbar container space-y-20">{children}</div>
}

export function PetitionsHeaderSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-7 text-center">{children}</div>
}
