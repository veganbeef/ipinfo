export function isIPAddress(input: string): boolean {
  if (typeof input === 'string' && input.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
    return true;
  }
  return false;
}

export function isURL(input: string): boolean {
  if (typeof input === 'string' && input.match(/^(?:https?:\/\/)?\w+\.\w{2,4}$/)) {
    return true;
  }
  return false;
}

export function cleanURL(dirtyURL: string): string {
  return dirtyURL.replace(/^https?:\/\//, '');
}