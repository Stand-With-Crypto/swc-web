import { getPolls } from '@/utils/server/builder/models/data/polls'
import { prismaClient } from '@/utils/server/prismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

export interface PollResultsDataResponse {
  campaignName: string
  answers: {
    answer: string
    isOtherAnswer: boolean
  }[]
  computedAnswers: {
    answer: string
    totalVotes: number
    isOtherAnswer: boolean
  }[]
  computedAnswersWithOther: {
    answer: string
    totalVotes: number
    isOtherAnswer: boolean
  }[]
}

export interface PollsWithResults {
  pollData: {
    id: string
  } & SWCPoll['data']
  computedAnswers: PollResultsDataResponse['computedAnswers']
}

interface PollAnswer {
  answer: string
  isOtherAnswer: boolean
}

type PollVote = Record<
  string,
  {
    campaignName: string
    answers: PollAnswer[]
  }
>
export interface PollsVotesFromUserResponse {
  pollVote: PollVote
}

export async function getPollsResultsData({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}): Promise<Record<string, PollResultsDataResponse>> {
  const pollsAnswers = await prismaClient.userActionPollAnswer.findMany({
    where: {
      userActionPoll: {
        userAction: {
          countryCode,
        },
      },
    },
  })

  const groupedAnswers: Record<string, PollResultsDataResponse> = {}

  for (const poll of pollsAnswers) {
    const campaignName = poll.userActionCampaignName

    if (!groupedAnswers[campaignName]) {
      groupedAnswers[campaignName] = {
        campaignName,
        answers: [],
        computedAnswers: [],
        computedAnswersWithOther: [],
      }
    }

    groupedAnswers[campaignName].answers.push({
      answer: poll.answer,
      isOtherAnswer: poll.isOtherAnswer,
    })
  }

  for (const campaignName in groupedAnswers) {
    const answerMap = new Map<
      string,
      {
        totalVotes: number
        isOtherAnswer: boolean
      }
    >()

    const otherAnswerMap = new Map<
      string,
      {
        totalVotes: number
        isOtherAnswer: boolean
      }
    >()

    for (const { answer, isOtherAnswer } of groupedAnswers[campaignName].answers) {
      const existing = answerMap.get(answer)
      if (existing) {
        existing.totalVotes++
      } else {
        answerMap.set(answer, {
          totalVotes: 1,
          isOtherAnswer,
        })
      }

      const answerKey = isOtherAnswer ? 'other' : answer
      const existingOther = otherAnswerMap.get(answerKey)
      if (existingOther) {
        existingOther.totalVotes++
      } else {
        otherAnswerMap.set(answerKey, {
          totalVotes: 1,
          isOtherAnswer,
        })
      }
    }

    groupedAnswers[campaignName].computedAnswers = Array.from(answerMap.entries()).map(
      ([answer, data]) => ({
        answer,
        ...data,
      }),
    )

    groupedAnswers[campaignName].computedAnswersWithOther = Array.from(
      otherAnswerMap.entries(),
    ).map(([answer, data]) => ({
      answer,
      ...data,
    }))
  }

  return groupedAnswers
}

export async function getPollsVotesFromUser({
  userId,
  countryCode,
}: {
  userId: string
  countryCode: SupportedCountryCodes
}): Promise<PollsVotesFromUserResponse> {
  const pollVotes = await prismaClient.userActionPollAnswer.findMany({
    where: {
      userActionPoll: {
        userAction: {
          userId,
          countryCode,
        },
      },
    },
    select: {
      answer: true,
      isOtherAnswer: true,
      userActionCampaignName: true,
    },
  })

  const groupedAnswersByCampaignName: Record<
    string,
    {
      campaignName: string
      answers: { answer: string; isOtherAnswer: boolean }[]
    }
  > = {}

  for (const vote of pollVotes) {
    const campaign = vote.userActionCampaignName

    if (!groupedAnswersByCampaignName[campaign]) {
      groupedAnswersByCampaignName[campaign] = {
        campaignName: campaign,
        answers: [],
      }
    }

    groupedAnswersByCampaignName[campaign].answers.push({
      answer: vote.answer,
      isOtherAnswer: vote.isOtherAnswer,
    })
  }

  return { pollVote: groupedAnswersByCampaignName }
}

export async function getPollsWithAbsoluteResults({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}): Promise<PollsWithResults[]> {
  const builderIoPolls = await getPolls({ countryCode })
  const pollsResultsData = await getPollsResultsData({ countryCode })

  if (!builderIoPolls) {
    return []
  }

  const pollsWithResults = builderIoPolls.map(poll => {
    const pollResults = pollsResultsData[poll.id] || {
      computedAnswers: [],
      computedAnswersWithOther: [],
    }

    const allAnswers = poll.data.pollList.map(answer => ({
      answer: answer.value,
      displayName: answer.displayName,
      isOtherAnswer: false,
      totalVotes: 0,
    }))

    const computedAnswersMap = new Map<
      string,
      {
        answer: string
        displayName: string
        isOtherAnswer: boolean
        totalVotes: number
      }
    >()

    allAnswers.forEach(answer => {
      computedAnswersMap.set(answer.answer, answer)
    })

    pollResults.computedAnswers.forEach(({ answer, isOtherAnswer, totalVotes }) => {
      if (computedAnswersMap.has(answer)) {
        computedAnswersMap.set(answer, {
          ...computedAnswersMap.get(answer)!,
          totalVotes,
        })
      } else {
        computedAnswersMap.set(answer, {
          answer,
          displayName: answer,
          isOtherAnswer,
          totalVotes,
        })
      }
    })

    return {
      pollData: {
        ...poll.data,
        id: poll.id,
      },
      computedAnswers: Array.from(computedAnswersMap.values()),
    }
  })

  return pollsWithResults
}
