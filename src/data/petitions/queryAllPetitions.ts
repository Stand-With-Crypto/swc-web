import { PetitionData } from '@/types/petition'

// TODO: Replace with actual API call and database query
export async function queryAllPetitions(): Promise<PetitionData[]> {
  // Simulate network delay to mimic real API call
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock petition data - replace with actual data fetching logic
  const mockPetitions: PetitionData[] = [
    {
      slug: 'end-capital-gains-tax-crypto',
      title: 'End Capital Gains Tax on cryptocurrency gains',
      countryCode: 'US',
      description:
        'Sign this petition to help shape the future of crypto regulation and eliminate capital gains tax on cryptocurrency transactions.',
      content: `
        <h2>Why This Matters</h2>
        <p>Capital gains tax on cryptocurrency creates unfair barriers to digital asset adoption and innovation...</p>
      `,
      countSignaturesGoal: 25000,
      signaturesCount: 23053,
      enableAutomaticMilestones: true,
      image: null,
      milestones: [
        {
          title: 'Reached 20,000 signatures',
          datetimeCompleted: new Date('2024-01-10'),
        },
      ],
      datetimeFinished: null, // Current petition
    },
    {
      slug: 'repeal-finprom-act',
      title: 'Repeal the FinProm Act to make crypto purchases easier in the UK',
      countryCode: 'GB',
      description:
        'Help us reach our goal to show the UK government that citizens want easier access to cryptocurrency purchases.',
      content: `
        <h2>Why This Matters</h2>
        <p>The Financial Promotions Act creates unnecessary barriers for UK citizens looking to purchase cryptocurrency...</p>
      `,
      countSignaturesGoal: 45000,
      signaturesCount: 45000,
      enableAutomaticMilestones: true,
      image: null,
      milestones: [
        {
          title: 'Featured in national media',
          datetimeCompleted: new Date('2024-02-15'),
        },
      ],
      datetimeFinished: null, // Current petition
    },
    {
      slug: 'crypto-innovation-support',
      title: 'Support Cryptocurrency Innovation',
      countryCode: 'US',
      description:
        'Join thousands of advocates calling for sensible cryptocurrency regulations that foster innovation.',
      content: `
        <h2>Support Innovation</h2>
        <p>Help us advocate for regulations that protect consumers while encouraging technological advancement...</p>
      `,
      countSignaturesGoal: 15000,
      signaturesCount: 10,
      enableAutomaticMilestones: true,
      image: null,
      milestones: [],
      datetimeFinished: null, // Current petition
    },
    {
      slug: 'crypto-rights-protection-2023',
      title: 'Protect Cryptocurrency Rights',
      countryCode: 'US',
      description:
        'This petition helped establish important precedents for cryptocurrency user rights and privacy protection.',
      content: `
        <h2>Historical Achievement</h2>
        <p>This successful petition contributed to landmark legislation protecting cryptocurrency users...</p>
      `,
      countSignaturesGoal: 30000,
      signaturesCount: 23053,
      enableAutomaticMilestones: true,
      image: null,
      milestones: [
        {
          title: 'Goal reached!',
          datetimeCompleted: new Date('2023-12-01'),
        },
        {
          title: 'Featured in congressional hearing',
          datetimeCompleted: new Date('2023-11-15'),
        },
      ],
      datetimeFinished: new Date('2023-12-15'), // Past petition
    },
    {
      slug: 'defi-regulation-clarity-2023',
      title: 'DeFi Regulation Clarity',
      countryCode: 'US',
      description:
        'Successfully advocated for clear guidelines on decentralized finance protocols and smart contracts.',
      content: `
        <h2>DeFi Success Story</h2>
        <p>This petition helped secure regulatory clarity for DeFi protocols...</p>
      `,
      countSignaturesGoal: 20000,
      signaturesCount: 23053,
      enableAutomaticMilestones: true,
      image: null,
      milestones: [
        {
          title: 'Regulatory guidance published',
          datetimeCompleted: new Date('2023-10-30'),
        },
      ],
      datetimeFinished: new Date('2023-11-01'), // Past petition
    },
    {
      slug: 'mining-protection-act-2023',
      title: 'Cryptocurrency Mining Protection',
      countryCode: 'US',
      description:
        'Protected cryptocurrency mining operations from restrictive regulations and environmental overreach.',
      content: `
        <h2>Mining Rights Protected</h2>
        <p>This petition was instrumental in protecting cryptocurrency mining operations...</p>
      `,
      countSignaturesGoal: 15000,
      signaturesCount: 439,
      enableAutomaticMilestones: true,
      image: null,
      milestones: [
        {
          title: 'Legislative committee hearing',
          datetimeCompleted: new Date('2023-09-20'),
        },
      ],
      datetimeFinished: new Date('2023-10-15'), // Past petition
    },
  ]

  return mockPetitions
}
