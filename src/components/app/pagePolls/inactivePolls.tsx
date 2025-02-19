import { PollResults } from '@/components/app/pagePolls/pollResults'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

interface InactivePollsProps {
  inactivePolls: SWCPoll[] | null
  pollsResultsData: Record<string, PollResultsDataResponse>
  isLoading: boolean
  userPollsData: PollsVotesFromUserResponse | undefined
}

export function InactivePolls({
  inactivePolls,
  pollsResultsData,
  isLoading,
  userPollsData,
}: InactivePollsProps) {
  return (
    <div className="px-4">
      <h2 className="mb-6 text-[28px] font-medium leading-9">Closed polls</h2>
      <div className="flex flex-col gap-8">
        {inactivePolls &&
          inactivePolls.map(poll => (
            <div className="rounded-2xl bg-[#F5F8FF]" key={poll.id}>
              <PollResults
                currentPoll={poll}
                hideVoteAgain={true}
                inactivePoll={true}
                isLoading={isLoading}
                pollsResultsData={pollsResultsData}
                userPollsData={userPollsData}
              />
            </div>
          ))}
      </div>
    </div>
  )
}
