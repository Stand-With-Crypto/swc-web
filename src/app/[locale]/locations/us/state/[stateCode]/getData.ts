import { DTSI_Person } from '@/data/dtsi/generated'

type Person = Pick<
  DTSI_Person,
  | 'firstName'
  | 'lastName'
  | 'firstNickname'
  | 'nameSuffix'
  | 'profilePictureUrl'
  | 'profilePictureUrlDimensions'
  | 'id'
>

export interface StatementPosition {
  politician: Person
  position: 'agrees' | 'disagrees' | 'neutral'
}

export interface Statement {
  statement: string
  positions: StatementPosition[]
}

const steveGarvey: Person = {
  id: '1',
  firstName: 'Steve',
  lastName: 'Garvey',
  firstNickname: '',
  nameSuffix: '',
  profilePictureUrl: '/politicians/steve-garvey.png',
  profilePictureUrlDimensions: { width: 272, height: 272 },
}

const adamSchiff: Person = {
  id: '2',
  firstName: 'Adam',
  lastName: 'Schiff',
  firstNickname: '',
  nameSuffix: '',
  profilePictureUrl: '/politicians/adam-schiff.png',
  profilePictureUrlDimensions: { width: 272, height: 272 },
}

const katiePorter: Person = {
  id: '3',
  firstName: 'Katie',
  lastName: 'Porter',
  firstNickname: '',
  nameSuffix: '',
  profilePictureUrl: '/politicians/katie-porter.png',
  profilePictureUrlDimensions: { width: 272, height: 272 },
}

// LATER-TASK remove data mocks
export function getData(stateCode: string): Statement[] | null {
  if (stateCode !== 'ca') {
    return null
  }

  return [
    {
      statement:
        'Blockchain technology and digital assets will play a major role in the next wave of technological innovation globally.',
      positions: [
        {
          politician: steveGarvey,
          position: 'neutral',
        },
        {
          politician: adamSchiff,
          position: 'agrees',
        },
        {
          politician: katiePorter,
          position: 'neutral',
        },
      ],
    },
    {
      statement:
        'American cryptocurrency and the digital asset industry is driving economic growth and supporting millions of jobs across the U.S.',
      positions: [
        {
          politician: steveGarvey,
          position: 'neutral',
        },
        {
          politician: adamSchiff,
          position: 'agrees',
        },
        {
          politician: katiePorter,
          position: 'neutral',
        },
      ],
    },
    {
      statement:
        'It’s important for the U.S. to modernize the regulatory environment for crypto and digital assets. This will ensure proper consumer protection while fostering responsible innovation.',
      positions: [
        {
          politician: steveGarvey,
          position: 'neutral',
        },
        {
          politician: adamSchiff,
          position: 'agrees',
        },
        {
          politician: katiePorter,
          position: 'neutral',
        },
      ],
    },
    {
      statement: 'Technology innovation for California includes Web3.',
      positions: [
        {
          politician: steveGarvey,
          position: 'neutral',
        },
        {
          politician: adamSchiff,
          position: 'agrees',
        },
        {
          politician: katiePorter,
          position: 'neutral',
        },
      ],
    },
  ]
}
