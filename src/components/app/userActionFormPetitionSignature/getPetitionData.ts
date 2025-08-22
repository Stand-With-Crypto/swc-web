import { PetitionData } from '@/types/petition'

// This file will be deleted once we have a real API call and database query

export async function getPetitionData(petitionSlug?: string): Promise<PetitionData> {
  // TODO: Replace with actual API call or database query

  // Simulate network delay in development
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Mock petition data - replace with actual data fetching logic
  const mockData: PetitionData = {
    slug: petitionSlug || 'crypto-innovation-act',
    title: 'Support Cryptocurrency Innovation Act',
    countryCode: 'US',
    description:
      'Help us reach our goal to show Congress that Americans support clear, balanced cryptocurrency regulations that protect consumers while fostering innovation.',
    content: `
      <h2>Why This Matters</h2>
      <p>The cryptocurrency industry has grown exponentially, but unclear regulations have created uncertainty for both consumers and businesses. The Cryptocurrency Innovation Act would provide the regulatory clarity needed to:</p>
      <ul>
        <li>Protect consumers from fraud while preserving innovation</li>
        <li>Establish clear guidelines for digital asset businesses</li>
        <li>Position America as a leader in blockchain technology</li>
        <li>Create jobs and economic growth in the digital economy</li>
      </ul>
      <p>Your signature helps demonstrate widespread support for sensible cryptocurrency regulation.</p>
    `,
    countSignaturesGoal: 100000,
    signaturesCount: 58209,
    enableAutomaticMilestones: true,
    image: null,
    milestones: [
      {
        title: 'Reached 50,000 signatures',
        datetimeCompleted: new Date('2024-01-15'),
      },
      {
        title: 'Featured in national media',
        datetimeCompleted: new Date('2024-02-01'),
      },
    ],
    datetimeFinished: null,
  }

  return mockData
}
