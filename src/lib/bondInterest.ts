/**
 * Bond interest: Simple interest (non-compounded, paid out).
 *
 * Core formula:  interest = principal × APY × (months / 12)
 *
 * Per-period payouts:
 *   Weekly:    principal × APY / 52
 *   Monthly:   principal × APY / 12
 *   Quarterly: principal × APY / 4
 *
 * Principal never changes.
 */

export type PayoutFrequency = 'weekly' | 'monthly' | 'quarterly';

/** Number of payout periods per year for each frequency. */
function periodsPerYear(freq: PayoutFrequency): number {
  if (freq === 'weekly') return 52;
  if (freq === 'quarterly') return 4;
  return 12; // monthly
}

/** Number of payout periods in a given number of months. */
function periodsInTerm(freq: PayoutFrequency, termMonths: number): number {
  if (freq === 'weekly') return Math.round(termMonths * (52 / 12));
  if (freq === 'quarterly') return Math.floor(termMonths / 3);
  return termMonths; // monthly
}

/**
 * Interest for one period (simple interest, paid out).
 *   Weekly:    principal × APY / 52
 *   Monthly:   principal × APY / 12
 *   Quarterly: principal × APY / 4
 */
export function interestForPeriod(
  principal: number,
  apy: number,
  freq: PayoutFrequency,
): number {
  if (principal <= 0) return 0;
  return principal * apy / periodsPerYear(freq);
}

/**
 * Total value (principal + accrued simple interest) at a given month.
 *   interest = principal × APY × (month / 12)
 */
export function valueAtMonth(
  principal: number,
  apy: number,
  freq: PayoutFrequency,
  month: number
): number {
  if (month <= 0 || principal <= 0) return principal;
  const interest = principal * apy * (month / 12);
  return principal + interest;
}

/**
 * Parse sector string to payout frequency (weekly / monthly / quarterly).
 */
export function getFrequency(sector: string): PayoutFrequency {
  const s = (sector || '').toLowerCase();
  if (s.includes('week')) return 'weekly';
  if (s.includes('quarter')) return 'quarterly';
  return 'monthly';
}

/**
 * Round down to 2 decimals for display (USDT/USDC style).
 */
export function roundDownDisplay(amount: number): number {
  return Math.floor(amount * 100) / 100;
}

/* ──────────────────────────────────────────────────────────
   PAYOUT SCHEDULE – Simple Interest (non-compounded)
   Each payout is the same fixed amount:
     Weekly:    principal × APY / 52
     Monthly:   principal × APY / 12
     Quarterly: principal × APY / 4
   Principal never changes.
   ────────────────────────────────────────────────────────── */

export type PayoutRow = {
  date: Date;
  days: number;
  interest: number;
  principal: number;
};

export type PayoutSchedule = {
  next: PayoutRow | null;
  rows: PayoutRow[];
  totalInterest: number;
};

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function diffDays(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / ms));
}

function nextPayoutDateCalc(fromDate: Date, frequency: PayoutFrequency): Date {
  if (frequency === 'weekly') return addDays(fromDate, 7);
  if (frequency === 'monthly') return addMonths(fromDate, 1);
  if (frequency === 'quarterly') return addMonths(fromDate, 3);
  return addMonths(fromDate, 1); // fallback
}

/**
 * Build the full payout schedule from startDate to term end.
 *
 * Every payout is the same fixed amount (simple interest, non-compounded):
 *   Weekly:    principal × APY / 52
 *   Monthly:   principal × APY / 12
 *   Quarterly: principal × APY / 4
 *
 * Principal never changes. Dates are real calendar dates.
 */
export function buildPayoutSchedule({
  principal,
  apy,
  startDate,
  termMonths,
  frequency,
}: {
  principal: number;
  apy: number;
  startDate: Date;
  termMonths: number;
  frequency: PayoutFrequency;
}): PayoutSchedule {
  const endDate = addMonths(startDate, termMonths);
  // Fixed payout per period
  const payoutPerPeriod = principal * apy / periodsPerYear(frequency);

  let prevDate = new Date(startDate);
  let payDate = nextPayoutDateCalc(prevDate, frequency);

  const rows: PayoutRow[] = [];

  while (payDate <= endDate) {
    const days = diffDays(prevDate, payDate);

    rows.push({
      date: new Date(payDate),
      days,
      interest: payoutPerPeriod,
      principal,
    });

    prevDate = new Date(payDate);
    payDate = nextPayoutDateCalc(prevDate, frequency);
  }

  // Include final payout at term end if the last period date we added is before endDate (e.g. term ends mid-period)
  if (rows.length > 0 && prevDate.getTime() < endDate.getTime()) {
    rows.push({
      date: new Date(endDate),
      days: diffDays(prevDate, endDate),
      interest: payoutPerPeriod,
      principal,
    });
  }

  const next = rows.length > 0 ? rows[0] : null;
  const totalInterest = rows.reduce((sum, r) => sum + r.interest, 0);

  return { next, rows, totalInterest };
}

/**
 * Parse term string (e.g. "6 months", "24 months") to number of months.
 */
export function parseTermMonths(fundSize: string): number {
  const m = fundSize.match(/(\d+)\s*month/i);
  if (m) return parseInt(m[1], 10);
  const y = fundSize.match(/(\d+)\s*year/i);
  if (y) return parseInt(y[1], 10) * 12;
  return 12;
}

/**
 * Format USD currency with 2 decimal places.
 */
export const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
