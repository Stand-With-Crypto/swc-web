import { useEffect, useState } from 'react'

export interface PetitionData {
  title: string
  description: string
  goal: number
  signatures: number
}

export interface UsePetitionDataReturn {
  data: PetitionData | null
  isLoading: boolean
}

export function usePetitionData(): UsePetitionDataReturn {
  const [data, setData] = useState<PetitionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API request
    const fetchPetitionData = async () => {
      setIsLoading(true)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock petition data
      const mockData: PetitionData = {
        title: 'Support Cryptocurrency Innovation Act',
        description:
          'Help us reach our goal to show Congress that Americans support clear, balanced cryptocurrency regulations that protect consumers while fostering innovation.',
        goal: 100000,
        signatures: 58209,
      }

      setData(mockData)
      setIsLoading(false)
    }

    void fetchPetitionData()
  }, [])

  return {
    data,
    isLoading,
  }
}
