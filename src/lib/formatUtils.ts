/**
 * Centralized date and number formatting for the app.
 * Use these instead of duplicating format logic in components.
 */

/**
 * Shorten an address or string for display (e.g. "0x1234...abcd").
 */
export function shortenAddress(address: string, start = 8, end = 4): string {
  if (!address || address.length <= start + end) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

/**
 * Parse a date string in "DD/MM/YYYY" or "DD.MM.YYYY" format (e.g. for filter comparison).
 */
export function parseDotDate(dateTime: string): Date {
  const [datePart] = dateTime.split(' ');
  const parts = datePart.split(/[./]/).map(Number);
  const [dd, mm, yyyy] = parts;
  return new Date(yyyy, mm - 1, dd);
}

/**
 * Format an ISO or date string as "DD/MM/YYYY" for filter/display consistency.
 */
export function formatDateDot(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Format an ISO or date string as "DD/MM/YYYY HH:MM" (24h).
 */
export function formatIsoToDisplay(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Days until maturity or "Matured" if in the past.
 */
export function daysLeftFromMaturity(maturityDateYmd: string): string {
  try {
    const maturity = new Date(maturityDateYmd + 'T23:59:59');
    const now = new Date();
    if (maturity.getTime() <= now.getTime()) return 'Matured';
    const days = Math.ceil((maturity.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return `${days} days`;
  } catch {
    return '—';
  }
}

/**
 * True if the strategy redemption period has expired (no redemption, or redemption window after maturity has ended).
 * redemption e.g. "30 days", "60 days", "120 days", "No".
 */
export function isRedemptionExpired(maturityDateYmd: string, redemption?: string | null): boolean {
  const r = (redemption ?? '').trim().toLowerCase();
  if (!r || r === 'no') return true;
  const match = r.match(/^(\d+)\s*days?$/);
  if (!match) return false; // unknown format: allow redeem
  try {
    const maturity = new Date(maturityDateYmd + 'T23:59:59');
    const days = parseInt(match[1], 10);
    const redemptionEnd = new Date(maturity);
    redemptionEnd.setDate(redemptionEnd.getDate() + days);
    return Date.now() > redemptionEnd.getTime();
  } catch {
    return false;
  }
}

/**
 * Format date as "DD/MM/YYYY".
 */
export function formatDateShort(isoOrDate: string | number | Date): string {
  try {
    const d = new Date(isoOrDate);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '—';
  }
}

/**
 * Format date as "DD/MM/YYYY".
 */
export function formatDateDdMmYyyy(date: string | number | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format ISO string as "DD/MM/YYYY, HH:MM" (24h).
 */
export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}, ${hh}:${min}`;
  } catch {
    return '—';
  }
}

/**
 * Format date as "DD/MM/YYYY" for maturity/display.
 */
export function formatDateMedium(isoOrYmd: string): string {
  try {
    const d = new Date(isoOrYmd.includes('T') ? isoOrYmd : isoOrYmd + 'T12:00:00');
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return isoOrYmd || '—';
  }
}

/**
 * Date range label for filters: "17 Dec 2025" or "15 Jan - 20 Feb 2026".
 */
export function formatDateRangeLabel(from: string | null, to: string | null): string {
  if (!from && !to) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (from && !to)
    return new Date(from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (!from && to) return new Date(to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fromDate = new Date(from!);
  const toDate = new Date(to!);
  if (from === to) return fromDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fromDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${toDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
