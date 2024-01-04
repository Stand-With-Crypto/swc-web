export const prettyStringify = (obj: any) => JSON.stringify(obj, null, 4)

export const prettyLog = (obj: any) => console.log(prettyStringify(obj))
