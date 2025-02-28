import { UserActionType } from '@prisma/client'

import { getPolls } from '@/utils/server/builder/models/data/polls'
import { prismaClient } from '@/utils/server/prismaClient'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

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

export interface PollsVotesFromUserResponse {
  pollVote: Record<
    string,
    {
      campaignName: string
      answers: {
        answer: string
        isOtherAnswer: boolean
      }[]
    }
  >
}

export async function getPollsResultsData(): Promise<Record<string, PollResultsDataResponse>> {
  const pollsAnswers = await prismaClient.userActionPoll.findMany({
    where: {
      userAction: {
        actionType: UserActionType.POLL,
      },
    },
    include: {
      userAction: true,
      userActionPollAnswers: true,
    },
  })

  const groupedAnswers = pollsAnswers.reduce<Record<string, PollResultsDataResponse>>(
    (acc, poll) => {
      const { campaignName } = poll.userAction

      const processAnswers = (answers: typeof poll.userActionPollAnswers) =>
        answers.map(({ answer, isOtherAnswer }) => ({
          answer,
          isOtherAnswer,
        }))

      if (!acc[campaignName]) {
        acc[campaignName] = {
          campaignName,
          answers: [],
          computedAnswers: [],
          computedAnswersWithOther: [],
        }
      }

      acc[campaignName].answers = [
        ...acc[campaignName].answers,
        ...processAnswers(poll.userActionPollAnswers),
      ]

      const computedAnswers = acc[campaignName].answers.reduce<
        Array<{ answer: string; totalVotes: number; isOtherAnswer: boolean }>
      >((computed, { answer, isOtherAnswer }) => {
        const existingAnswer = computed.find(a => a.answer === answer)
        if (existingAnswer) {
          return computed.map(a =>
            a.answer === answer ? { ...a, totalVotes: a.totalVotes + 1, isOtherAnswer } : a,
          )
        }
        return [...computed, { answer, totalVotes: 1, isOtherAnswer }]
      }, [])

      const computedAnswersWithOther = acc[campaignName].answers.reduce<
        Array<{ answer: string; totalVotes: number; isOtherAnswer: boolean }>
      >((computed, { answer, isOtherAnswer }) => {
        const answerKey = isOtherAnswer ? 'other' : answer
        const existingAnswer = computed.find(a => a.answer === answerKey)
        if (existingAnswer) {
          return computed.map(a =>
            a.answer === answerKey ? { ...a, totalVotes: a.totalVotes + 1, isOtherAnswer } : a,
          )
        }
        return [...computed, { answer: answerKey, totalVotes: 1, isOtherAnswer }]
      }, [])

      acc[campaignName] = {
        ...acc[campaignName],
        computedAnswers,
        computedAnswersWithOther,
      }

      return acc as Record<string, PollResultsDataResponse>
    },
    {},
  )

  return groupedAnswers
}

export async function getPollsVotesFromUser(userId: string): Promise<PollsVotesFromUserResponse> {
  const pollVote = await prismaClient.userActionPollAnswer.findMany({
    where: {
      userActionPoll: {
        userAction: {
          userId,
        },
      },
    },
    select: {
      userActionCampaignName: true,
      answer: true,
      isOtherAnswer: true,
    },
  })

  const groupedAnswersByCampaignName = pollVote.reduce(
    (acc, { answer, isOtherAnswer, userActionCampaignName }) => {
      if (!acc[userActionCampaignName]) {
        acc[userActionCampaignName] = {
          campaignName: userActionCampaignName,
          answers: [],
        }
      }

      acc[userActionCampaignName].answers.push({ answer, isOtherAnswer })

      return acc
    },
    {} as Record<
      string,
      { campaignName: string; answers: { answer: string; isOtherAnswer: boolean }[] }
    >,
  )

  return { pollVote: groupedAnswersByCampaignName }
}

export async function getPollsWithAbsoluteResults(): Promise<PollsWithResults[]> {
  const builderIoPolls = await getPolls()
  const pollsResultsData = await getPollsResultsData()

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
      { answer: string; displayName: string; isOtherAnswer: boolean; totalVotes: number }
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
        computedAnswersMap.set(answer, { answer, displayName: answer, isOtherAnswer, totalVotes })
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
