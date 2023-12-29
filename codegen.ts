import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    'src/data/dtsi/generated.ts': {
      documents: 'src/data/dtsi/**/*.ts',
      plugins: ['typescript', 'typescript-operations'],
      config: {
        scalars: {
          DateTime: 'string',
          BigInt: 'number',
          Bytes: 'unknown',
          Decimal: 'number',
          Json: 'unknown',
        },
        maybeValue: 'T | null | undefined',
        avoidOptionals: true,
        typesPrefix: 'DTSI_',
        namingConvention: {
          enumValues: 'change-case-all#upperCase',
        },
      },
      schema: 'src/data/dtsi/schema.graphql',
    },
  },
}

export default config
