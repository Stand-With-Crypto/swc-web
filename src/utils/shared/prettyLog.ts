export function prettyStringify(obj: any) {
  return JSON.stringify(obj, null, 4)
}

export function prettyLog(obj: any) {
  return console.log(prettyStringify(obj))
}
