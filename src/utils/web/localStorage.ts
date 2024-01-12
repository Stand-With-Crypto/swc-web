/*
There are many browser environments where localStorage is not available
We should only ever use localStorage for optional logic, and we should 
never block the user from using the site if localStorage is not available
*/

interface LocalStorageVal {
  data: any
  datetimeCreated: string
}

export const setLocalStorage = (key: string, data: any) => {
  try {
    const val: LocalStorageVal = { data, datetimeCreated: new Date().toISOString() }
    localStorage?.setItem(key, JSON.stringify(val))
  } catch (e) {}
}

export const getLocalStorage = <T>(key: string) => {
  try {
    const data = localStorage?.getItem(key)
    if (data) {
      const structure = JSON.parse(data) as LocalStorageVal
      return structure.data as T
    }
  } catch (e) {}
  return null
}

export const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (e) {}
}
