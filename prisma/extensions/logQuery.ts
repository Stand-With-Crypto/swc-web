import { Prisma } from '@prisma/client'

export default Prisma.defineExtension(client => {
  return client.$extends({
    name: 'logQuery',
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = performance.now()
          const result = await query(args)
          const end = performance.now()
          const time = end - start
          console.log({ model, operation, args: JSON.stringify(args), time: `${time}ms` })
          return result
        },
      },
    },
  })
})
