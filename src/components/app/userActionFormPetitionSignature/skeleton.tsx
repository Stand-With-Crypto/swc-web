import {
  FormContainer,
  PetitionHeader,
  PetitionProgress,
  PrivacyNotice,
  SubmitSection,
} from '@/components/app/userActionFormPetitionSignature'
import { Button } from '@/components/ui/button'
import { FormItemSkeleton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'

export function UserActionFormPetitionSignatureSkeleton() {
  return (
    <div className="flex h-full flex-col space-y-0 max-md:justify-between">
      <LoadingOverlay />

      <PetitionHeader
        description="Please wait while we load the petition details."
        petitionSlug={undefined}
        title="Loading petition..."
      />

      <PetitionProgress goal={100000} progressPercentage={33} signatures={0} />

      <FormContainer>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormItemSkeleton>
            <label>First Name</label>
            <Input placeholder="Your first name" />
          </FormItemSkeleton>
          <FormItemSkeleton>
            <label>Last name</label>
            <Input placeholder="Your last name" />
          </FormItemSkeleton>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormItemSkeleton>
            <label>Email</label>
            <Input placeholder="Your email address" />
          </FormItemSkeleton>
          <FormItemSkeleton>
            <label>Zip code</label>
            <Input placeholder="000000" />
          </FormItemSkeleton>
        </div>
      </FormContainer>

      <div>
        <PrivacyNotice />

        <SubmitSection>
          <Button className="h-12 w-full md:w-[75%]" disabled size="default" type="submit">
            Sign
          </Button>
        </SubmitSection>
      </div>
    </div>
  )
}
