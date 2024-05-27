'use client'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

import { actionUpdateUserHasOptedInToMembership } from '@/actions/actionUpdateUserHasOptedInToMembership'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'
import { triggerServerActionForForm } from '@/utils/web/formUtils'

export function HasOptedInToMembershipForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void
  onSuccess: () => void
}) {
  const [checked, setChecked] = useState(false)
  const [formState, setFormState] = useState<'submitting' | 'default'>('default')
  return (
    <div>
      <div className="space-y-6 text-center">
        <PageTitle size="sm">What is a 501(c)4 and what does it mean to become a member?</PageTitle>
        <PageSubTitle size={'md'}>
          A 501(c)4 is a type of nonprofit - in our case, a nonprofit that acts as a pro-crypto
          advocacy group. Some benefits of joining Stand With Crypto as a 501(c)4 member include:
        </PageSubTitle>
        <ul className="ml-4 mt-4 list-disc text-left text-fontcolor-muted">
          <li>
            Receiving in-depth member-exclusive analyses on upcoming elections that impact the
            future of crypto in America
          </li>
          <li>
            Making your voice heard and ensure Stand With Crypto will advocate for issues you care
            about
          </li>
          <li>
            Joining a group of like-minded individuals to form the largest pro-crypto organization
            in the US
          </li>
        </ul>
      </div>
      <div className="mt-12 flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <label className="flex items-center gap-4">
          <Checkbox checked={checked} onCheckedChange={val => setChecked(val as boolean)} />
          <p className="leading-4 text-fontcolor-muted">
            By checking this box, I agree to become a Stand With Crypto Alliance member.
          </p>
        </label>
        <Button
          className="text-center"
          disabled={!checked || formState === 'submitting'}
          onClick={async () => {
            setFormState('submitting')
            await triggerServerActionForForm(
              {
                formName: 'Update User Has Opted In To Membership',
                payload: undefined,
              },
              () => actionUpdateUserHasOptedInToMembership(),
            )
            setFormState('default')
            onSuccess()
          }}
          size="lg"
        >
          Join
        </Button>
      </div>

      <div className={cn('left-2', dialogButtonStyles)} onClick={() => onCancel} role="button">
        <ArrowLeft size={20} />
      </div>
    </div>
  )
}
