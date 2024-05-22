import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Video } from '@/components/ui/video'

export const UserActionFormEmailCongresspersonSuccess = () => {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <Video
        className="h-[180px] w-[345px] rounded-xl object-cover"
        src="/actionTypeVideos/swca_email.mp4"
      />

      <div className="space-y-2">
        <PageTitle size="sm">You emailed your representatives!</PageTitle>
        <PageSubTitle size={'md'}>
          Keep up the good work! Your voice matters and can make a difference in shaping policies
          that affect our community.
        </PageSubTitle>
      </div>
    </div>
  )
}
