import { builderSDKAdmin } from '@/utils/server/builder/builderSDKAdmin'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type QuestionFieldType = 'boolean' | 'text'

interface BuilderSubField {
  name: string
  friendlyName?: string
  type: string
  defaultValue?: unknown
}

interface BuilderQuestionField extends BuilderSubField {
  type: QuestionFieldType
}

interface BuilderListField {
  name: string
  friendlyName?: string
  type: 'list'
  subFields: BuilderSubField[]
}

type BuilderField = BuilderListField | BuilderSubField

interface BuilderModel {
  id: string
  name?: string
  fields: BuilderField[]
}

interface BuilderModelQueryResponse {
  data?: { model?: BuilderModel }
}

const configFields = ['isEnabled', 'countryCode', 'dtsiSlug']

const isQuestionField = (sf: BuilderSubField): sf is BuilderQuestionField =>
  !configFields.includes(sf.name) && (sf.type === 'boolean' || sf.type === 'text')

interface QuestionConfig {
  key: string
  label: string
  type: QuestionFieldType
}

export interface FormTypeConfig {
  key: string
  label: string
  questions: QuestionConfig[]
}

export interface BuilderFormConfig {
  modelId: string
  formTypes: FormTypeConfig[]
}

// TODO QUESTIONNAIRE: Centralize this model id
const FORM_MODEL_ID = 'd065218114484de6919b4863e3e3a167'

const isFormEnabled =
  (countryCode: SupportedCountryCodes) =>
  (field: BuilderField): field is BuilderListField => {
    return (
      field?.name?.includes(countryCode) &&
      field?.type === 'list' &&
      'subFields' in field &&
      Array.isArray(field.subFields) &&
      field.subFields.some(
        (sf: BuilderSubField) => sf?.name === 'isEnabled' && Boolean(sf?.defaultValue),
      )
    )
  }

export const getBuilderForm = async (
  countryCode: SupportedCountryCodes,
): Promise<BuilderFormConfig | null> => {
  const { data } = (await builderSDKAdmin.query({
    model: [
      { id: FORM_MODEL_ID },
      {
        id: true,
        name: true,
        fields: true,
      },
    ],
  })) as BuilderModelQueryResponse

  const model = data?.model

  // TODO QUESTIONNAIRE: Remove this console.log
  console.log('--- model:', JSON.stringify(model, null, 2))

  if (!model?.fields) return null

  const formTypes: FormTypeConfig[] = model.fields.filter(isFormEnabled(countryCode)).map(field => {
    const questions: QuestionConfig[] = (field.subFields ?? []).filter(isQuestionField).map(sf => ({
      key: sf.name,
      label: sf.friendlyName ?? sf.name,
      type: sf.type,
    }))

    return {
      key: field.name,
      label: field.friendlyName ?? field.name,
      questions,
    }
  })

  return {
    modelId: model.id,
    formTypes,
  }
}
