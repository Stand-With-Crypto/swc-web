/*
 We add the __client:true property to ensure that it is a unique type from it's db counterpart
 This way, if someone accidentally tries to to a server model directly to any component that accepts a client model
 the type signature is guaranteed to break. This ensures people are always sanitizing their database models before passing to the client
*/
export type ClientModel<T> = T & { __client: true }

export const getClientModel = <T>(record: T): ClientModel<T> => {
  return { ...record, __client: true }
}
