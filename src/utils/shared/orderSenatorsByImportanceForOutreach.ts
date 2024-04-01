const HIGH_PRIORITY_SENATOR_DTSI_SLUGS_FOR_OUTREACH = [
  'tim---scott',
  'sherrod---brown',
  'jack---reed',
  'mike---crapo',
  'robert---menendez---1',
  'mike---rounds',
  'mark---warner',
  'jon---tester',
  'john---kennedy',
  'bill---hagerty',
  'elizabeth---wareen',
  'cynthia---lummis',
  'tina---smith',
  'katie---britt',
  'kevin---cramer',
  'raphael---warnock',
  'john---fetterman',
  'steve---daines',
  'laphonza---butler',
  'catherine---cortezmasto',
  'chris---vanhollen',
]

// there are some domains that use this logic where we must select one senator. This function ensures that senators are ordered by importance to us
export function orderSenatorsByImportanceForOutreach<T extends { slug: string }>(list: T[]) {
  const orderedList = [...list]
  orderedList.sort((a, b) => {
    const indexA = HIGH_PRIORITY_SENATOR_DTSI_SLUGS_FOR_OUTREACH.indexOf(a.slug)
    const indexB = HIGH_PRIORITY_SENATOR_DTSI_SLUGS_FOR_OUTREACH.indexOf(b.slug)
    if (indexA === -1) {
      if (indexB === -1) {
        return 0
      }
      return 1
    }
    if (indexB === -1) {
      return -1
    }
    return indexA - indexB
  })
  return orderedList
}
