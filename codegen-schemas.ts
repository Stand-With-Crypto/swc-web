import 'dotenv/config'

import type { CodegenConfig } from '@graphql-codegen/cli'

function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    console.warn(`Required environment variable ${name} is missing. Value was ${value!}`)
  }
  return value!
}

const DO_THEY_SUPPORT_IT_API_KEY = requiredEnv(
  process.env.DO_THEY_SUPPORT_IT_API_KEY,
  'DO_THEY_SUPPORT_IT_API_KEY',
)

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    'src/data/dtsi/schema.graphql': {
      plugins: ['schema-ast'],
      schema: {
        [process.env.USE_DTSI_PRODUCTION_API === 'true'
          ? 'https://www.dotheysupportit.com/api/graphql'
          : 'https://testing.dotheysupportit.com/api/graphql']: {
          headers: {
            Authorization: DO_THEY_SUPPORT_IT_API_KEY,
          },
        },
      },
    },
  },
}

export default config
