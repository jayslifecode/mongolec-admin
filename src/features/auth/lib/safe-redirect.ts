/** Only same-site paths are allowed as a post-login redirect (blocks //evil.com and absolute URLs). */
export function safeRedirectPath(path?: string | null): string {
  if (!path || !path.startsWith('/')) return '/'
  if (path.startsWith('//') || path.startsWith('/\\')) return '/'
  return path
}
