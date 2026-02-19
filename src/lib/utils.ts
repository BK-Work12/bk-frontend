/**
 * Shorten an id string to prefix + "…" + suffix (e.g. for transaction IDs).
 * @param id - The full id string
 * @param prefixLen - Number of leading characters (default 4)
 * @param suffixLen - Number of trailing characters (default 4)
 * @returns Shortened string, or full string if length <= prefixLen + suffixLen
 */
export function shortenId(id: string, prefixLen = 4, suffixLen = 4): string {
  const s = String(id ?? '').trim();
  if (s.length <= prefixLen + suffixLen) return s;
  return `${s.slice(0, prefixLen)}…${s.slice(-suffixLen)}`;
}
