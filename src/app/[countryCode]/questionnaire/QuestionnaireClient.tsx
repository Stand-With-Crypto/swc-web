'use client'

import * as React from 'react'

import { DynamicQuestionnaireForm } from '@/components/app/questionnaire/DynamicQuestionnaireForm'
import { FormSelector } from '@/components/app/questionnaire/FormSelector'
import { BuilderFormConfig } from '@/data/questionnaire/getBuilderForm'
import { useCountryCode } from '@/hooks/useCountryCode'

export function QuestionnaireClient({ config }: { config: BuilderFormConfig }) {
  const [selectedFormKey, setSelectedFormKey] = React.useState<string | null>(null)
  const countryCode = useCountryCode()

  return (
    <div className="w-full max-w-2xl space-y-6">
      <FormSelector config={config} onChange={setSelectedFormKey} value={selectedFormKey} />

      {selectedFormKey && (
        <DynamicQuestionnaireForm
          config={config}
          countryCode={countryCode}
          onSubmitted={() => setSelectedFormKey(null)}
          selectedFormKey={selectedFormKey}
        />
      )}
    </div>
  )
}
