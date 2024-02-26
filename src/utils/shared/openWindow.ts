export const openWindow = (url: string, target = '_blank', features = 'noopener') =>
  window.open(url, target, features)
