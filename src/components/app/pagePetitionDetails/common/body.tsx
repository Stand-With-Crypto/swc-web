export function Root({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">{children}</div>
}

export function Main({ children }: { children: React.ReactNode }) {
  return <div className="space-y-10 lg:col-span-4">{children}</div>
}

export function Aside({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden lg:col-span-2 lg:block">
      <div className="sticky top-24">{children}</div>
    </div>
  )
}
