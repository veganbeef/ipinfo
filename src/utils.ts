/**
 * Util function to determine whether a string is a valid and properly formatted IPv4 address
 * @param {string} input
 * @returns {boolean}
 */
export function isIPAddress(input: string): boolean {
  if (typeof input === 'string' && input.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
    return true;
  }
  return false;
}

/**
 * Util function to determin whether a string is a valid and properly formatted URL
 * @param {string} input
 * @returns {boolean}
 */
export function isURL(input: string): boolean {
  if (typeof input === 'string' && input.match(/^(?:https?:\/\/)?\w+\.\w{2,4}$/)) {
    return true;
  }
  return false;
}

/**
 * Util function to strip the protocol (HTTP or HTTPS) from the URL
 * @param {string} dirtyURL - a properly formatted URL, with or without a protocol declaration
 * @returns {string}
 */
export function cleanURL(dirtyURL: string): string {
  return dirtyURL.replace(/^https?:\/\//, '');
}