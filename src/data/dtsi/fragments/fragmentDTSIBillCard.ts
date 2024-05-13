export const fragmentDTSIBillCard = /* GraphQL */ `
  fragment BillCard on Bill {
    id
    summary
    title
    shortTitle
    slug
    formattedSlug
    computedStanceScore
    pdfUrl
    status
  }
`
