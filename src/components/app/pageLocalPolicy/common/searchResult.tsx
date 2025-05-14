export function SearchResult({ children }: React.PropsWithChildren) {
  return <div className="flex flex-col items-center justify-center gap-4">{children}</div>
}

export function SearchResultTitle({ children }: React.PropsWithChildren) {
  return <h4 className="text-xl font-bold">{children}</h4>
}
SearchResult.Title = SearchResultTitle
