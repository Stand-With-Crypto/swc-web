'use client'

import { BuilderFormConfig } from '@/data/questionnaire/getBuilderForm'

export function FormSelector({
  config,
  value,
  onChange,
}: {
  config: BuilderFormConfig
  value: string | null
  onChange: (key: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      Forms:
      {config.formTypes.map(formType => (
        <button
          className="rounded-md border px-4 py-2 text-left hover:bg-muted"
          key={formType.key}
          onClick={() => onChange(formType.key)}
          type="button"
        >
          <div className="flex items-center justify-between gap-2">
            <span>{formType.label}</span>
            {value === formType.key && <span className="text-xs">Selected</span>}
          </div>
        </button>
      ))}
    </div>
  )
}
