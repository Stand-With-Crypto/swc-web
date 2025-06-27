import { UserActionType } from '@prisma/client'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'

export function renderActionSpecificData(userAction: SensitiveDataClientUserAction) {
  switch (userAction.actionType) {
    case UserActionType.EMAIL:
      if ('senderEmail' in userAction) {
        return (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Sender Email:</span> {userAction.senderEmail}
            </div>
            <div>
              <span className="font-semibold">First Name:</span> {userAction.firstName}
            </div>
            <div>
              <span className="font-semibold">Last Name:</span> {userAction.lastName}
            </div>
            <div>
              <span className="font-semibold">Recipients:</span>{' '}
              {userAction.userActionEmailRecipients.length}
            </div>
            {userAction.address && (
              <div>
                <span className="font-semibold">Address:</span>
                <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                  {JSON.stringify(userAction.address, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )
      }
      break

    case UserActionType.CALL:
      if ('recipientPhoneNumber' in userAction) {
        return (
          <div>
            <span className="font-semibold">Recipient Phone:</span>{' '}
            {userAction.recipientPhoneNumber}
          </div>
        )
      }
      break

    case UserActionType.DONATION:
      if ('amount' in userAction) {
        return (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Amount:</span> {userAction.amount}{' '}
              {userAction.amountCurrencyCode}
            </div>
            <div>
              <span className="font-semibold">Amount USD:</span> ${userAction.amountUsd}
            </div>
            <div>
              <span className="font-semibold">Recipient:</span> {userAction.recipient}
            </div>
          </div>
        )
      }
      break

    case UserActionType.VOTER_REGISTRATION:
      if ('usaState' in userAction) {
        return (
          <div>
            <span className="font-semibold">USA State:</span> {userAction.usaState}
          </div>
        )
      }
      break

    case UserActionType.VOTER_ATTESTATION:
      if ('usaState' in userAction) {
        return (
          <div>
            <span className="font-semibold">USA State:</span> {userAction.usaState}
          </div>
        )
      }
      break

    case UserActionType.VIEW_KEY_RACES:
      if ('usaState' in userAction) {
        return (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">USA State:</span> {userAction.usaState}
            </div>
            <div>
              <span className="font-semibold">Congressional District:</span>{' '}
              {userAction.usCongressionalDistrict}
            </div>
          </div>
        )
      }
      break

    case UserActionType.VOTING_INFORMATION_RESEARCHED:
      if ('addressId' in userAction) {
        return (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Address ID:</span> {userAction.addressId}
            </div>
            <div>
              <span className="font-semibold">Should Receive Notifications:</span>{' '}
              {userAction.shouldReceiveNotifications ? 'Yes' : 'No'}
            </div>
            {userAction.address && (
              <div>
                <span className="font-semibold">Address:</span>
                <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                  {JSON.stringify(userAction.address, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )
      }
      break

    case UserActionType.VOTING_DAY:
      if ('votingYear' in userAction) {
        return (
          <div>
            <span className="font-semibold">Voting Year:</span> {userAction.votingYear}
          </div>
        )
      }
      break

    case UserActionType.REFER:
      if ('referralsCount' in userAction) {
        return (
          <div>
            <span className="font-semibold">Referrals Count:</span> {userAction.referralsCount}
          </div>
        )
      }
      break

    case UserActionType.POLL:
      if ('userActionPollAnswers' in userAction) {
        return (
          <div>
            <span className="font-semibold">Poll Answers:</span>
            <div className="mt-2 space-y-2">
              {userAction.userActionPollAnswers.map((answer, index) => (
                <div className="rounded bg-gray-100 p-2 text-sm" key={index}>
                  <div>
                    <span className="font-semibold">Answer:</span> {answer.answer}
                  </div>
                  <div>
                    <span className="font-semibold">Is Other:</span>{' '}
                    {answer.isOtherAnswer ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-semibold">Campaign:</span> {answer.userActionCampaignName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
      break

    case UserActionType.VIEW_KEY_PAGE:
      if ('path' in userAction) {
        return (
          <div>
            <span className="font-semibold">Path:</span> {userAction.path}
          </div>
        )
      }
      break

    case UserActionType.TWEET_AT_PERSON:
      if ('recipientDtsiSlug' in userAction) {
        return (
          <div>
            <span className="font-semibold">Recipient DTSI Slug:</span>{' '}
            {userAction.recipientDtsiSlug}
          </div>
        )
      }
      break

    case UserActionType.RSVP_EVENT:
      if ('eventSlug' in userAction) {
        return (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Event Slug:</span> {userAction.eventSlug}
            </div>
            <div>
              <span className="font-semibold">Event State:</span> {userAction.eventState}
            </div>
          </div>
        )
      }
      break

    case UserActionType.OPT_IN:
      if ('optInType' in userAction) {
        return (
          <div>
            <span className="font-semibold">Opt In Type:</span> {userAction.optInType}
          </div>
        )
      }
      break

    case UserActionType.NFT_MINT:
      if ('nftMint' in userAction && userAction.nftMint) {
        return (
          <div>
            <span className="font-semibold">NFT Mint:</span>
            <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
              {JSON.stringify(userAction.nftMint, null, 2)}
            </pre>
          </div>
        )
      }
      break

    default:
      return <div className="text-gray-500">No specific data available for this action type.</div>
  }

  return <div className="text-gray-500">No specific data available for this action type.</div>
}
