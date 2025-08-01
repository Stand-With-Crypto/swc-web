interface AvatarGridProps {
  children: React.ReactNode
}

function AvatarGrid({ children }: AvatarGridProps) {
  return (
    <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2 md:grid-cols-[repeat(auto-fit,minmax(160px,200px))] md:gap-y-6">
      {children}
    </div>
  )
}

export default AvatarGrid
