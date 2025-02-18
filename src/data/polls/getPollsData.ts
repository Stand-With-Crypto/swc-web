import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'

export interface PollResultsDataResponse {
  campaignName: string
  answers: {
    answer: string
    isOtherAnswer: boolean
  }[]
  computedAnswers: {
    answer: string
    totalVotes: number
  }[]
  computedAnswersWithOther: {
    answer: string
    totalVotes: number
  }[]
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

      // Add new answers to existing campaign
      acc[campaignName].answers = [
        ...acc[campaignName].answers,
        ...processAnswers(poll.userActionPollAnswers),
      ]

      // Recompute vote totals for this campaign
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

      return acc
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
