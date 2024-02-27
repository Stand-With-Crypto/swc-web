export const openWindow = (url: string, target = '_blank', features = '') =>
  window.open(url, target, features)
