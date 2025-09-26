export function PetitionMobileSummaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-[70px] z-10 !mt-2 bg-background pb-0 pt-2 lg:hidden">{children}</div>
  )
}
