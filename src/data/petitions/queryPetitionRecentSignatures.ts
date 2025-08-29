// Mock function to get recent signatories for the carousel (will be replaced with actual API call)
export async function queryPetitionRecentSignatures(_petitionSlug: string): Promise<
  Array<{
    locale: string
    datetimeSigned: string
  }>
> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200))

  // Mock recent signatures data
  const mockSignatures = [
    { locale: 'California', datetimeSigned: new Date(Date.now() - 1000 * 60 * 5).toISOString() }, // 5 minutes ago
    { locale: 'Texas', datetimeSigned: new Date(Date.now() - 1000 * 60 * 15).toISOString() }, // 15 minutes ago
    { locale: 'New York', datetimeSigned: new Date(Date.now() - 1000 * 60 * 32).toISOString() }, // 32 minutes ago
    { locale: 'Florida', datetimeSigned: new Date(Date.now() - 1000 * 60 * 45).toISOString() }, // 45 minutes ago
    { locale: 'Illinois', datetimeSigned: new Date(Date.now() - 1000 * 60 * 67).toISOString() }, // 1 hour ago
  ]

  return mockSignatures
}
