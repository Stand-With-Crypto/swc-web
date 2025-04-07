import { getPolls } from '@/utils/server/builder/models/data/polls'
import { prismaClient } from '@/utils/server/prismaClient'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

export interface PollResultsDataResponse {
  campaignName: string
  answers: {
    answer: string
    isOtherAnswer: boolean
    userId: string
  }[]
  computedAnswers: {
    answer: string
    totalVotes: number
    isOtherAnswer: boolean
    userId: string
  }[]
  computedAnswersWithOther: {
    answer: string
    totalVotes: number
    isOtherAnswer: boolean
    userId: string
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
  const pollsAnswers = await prismaClient.userActionPollAnswer.findMany({
    include: {
      userActionPoll: {
        include: {
          userAction: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const groupedAnswersByCampaignName = pollsAnswers.reduce<Record<string, PollResultsDataResponse>>(
    (acc, pollAnswer) => {
      const campaignName = pollAnswer.userActionCampaignName

      if (!acc[campaignName]) {
        acc[campaignName] = {
          campaignName,
          answers: [],
          computedAnswers: [],
          computedAnswersWithOther: [],
        }
      }

      acc[campaignName].answers.push({
        answer: pollAnswer.answer,
        isOtherAnswer: pollAnswer.isOtherAnswer,
        userId: pollAnswer.userActionPoll.userAction.user.id,
      })

      const computedAnswers = acc[campaignName].answers.reduce<
        Array<{ answer: string; totalVotes: number; isOtherAnswer: boolean; userId: string }>
      >((computed, { answer, isOtherAnswer, userId }) => {
        const existingAnswer = computed.find(a => a.answer === answer)
        if (existingAnswer) {
          return computed.map(a =>
            a.answer === answer ? { ...a, totalVotes: a.totalVotes + 1, isOtherAnswer } : a,
          )
        }
        return [...computed, { answer, totalVotes: 1, isOtherAnswer, userId }]
      }, [])

      acc[campaignName].computedAnswers = computedAnswers

      const computedAnswersWithOther = acc[campaignName].answers.reduce<
        Array<{ answer: string; totalVotes: number; isOtherAnswer: boolean; userId: string }>
      >((computed, { answer, isOtherAnswer, userId }) => {
        const answerKey = isOtherAnswer ? 'other' : answer
        const existingAnswer = computed.find(a => a.answer === answerKey)
        if (existingAnswer) {
          return computed.map(a =>
            a.answer === answerKey ? { ...a, totalVotes: a.totalVotes + 1, isOtherAnswer } : a,
          )
        }
        return [...computed, { answer: answerKey, totalVotes: 1, isOtherAnswer, userId }]
      }, [])

      acc[campaignName].computedAnswersWithOther = computedAnswersWithOther

      return acc
    },
    {},
  )

  return groupedAnswersByCampaignName
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
      userId: '',
    }))

    const computedAnswersMap = new Map<
      string,
      {
        answer: string
        displayName: string
        isOtherAnswer: boolean
        totalVotes: number
        userId: string
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
          userId: '',
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
