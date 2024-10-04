export function LiveResultsGrid({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 divide-x-2 divide-y-2 lg:grid-cols-2">{children}</section>
  )
}

function GridItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center px-6 py-10 md:px-12 md:py-14 lg:px-20">
      {children}
    </div>
  )
}

LiveResultsGrid.GridItem = GridItem
