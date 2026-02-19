import type { CryptoData } from './constants/crypto';

export type ApiOk<T> = { success: true; data: T; message?: string };
export type ApiErr = { success: false; message: string; errors?: unknown };

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5057/api';

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export function getApiBase() {
  return API_BASE;
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(opts.headers || {});
  headers.set('Content-Type', 'application/json');
  if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`);

  const res = await fetch(url, {
    ...opts,
    headers,
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : undefined;

  if (!res.ok) {
    const message =
      (json as any)?.message ||
      (json as any)?.error ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  return json as T;
}

/**
 * Fetch top 6 cryptocurrencies from backend (CoinMarketCap API).
 * Use for dashboard crypto table. On failure or missing CMC key, use DEFAULT_CRYPTO_DATA from constants.
 */
export async function getCryptoList(): Promise<CryptoData[]> {
  const data = await apiFetch<CryptoData[]>('/crypto');
  return Array.isArray(data) && data.length > 0 ? data : [];
}

/** Total amount raised per strategy (package) – GET /api/wallet/strategy-totals. Keys are strategy ids. */
export async function getStrategyTotals(): Promise<Record<string, number>> {
  try {
    const res = await apiFetch<ApiOk<Record<string, number>>>('/wallet/strategy-totals', { method: 'GET' });
    return res.data ?? {};
  } catch {
    return {};
  }
}

/** Strategy/package for investment – matches backend IStrategy */
export type Strategy = {
  _id: string;
  strategyId: string;
  ids: string;
  name: string;
  type: 'fixed' | 'flexible' | 'sold';
  apy: number;
  termMonths: number;
  minInvestment: number;
  payoutFrequency: string;
  redemption: string;
  cap: number;
  /** Amount filled so far (USD). Optional; when missing, progress bar shows 0. */
  filled?: number;
  bg?: string;
  logo?: string;
  groupId: number;
  groupTitle: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Fetch all strategies from backend – GET /api/strategies */
export async function getStrategies(): Promise<Strategy[]> {
  try {
    const res = await apiFetch<ApiOk<Strategy[]>>('/strategies', { method: 'GET' });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** Strategy IDs for static export (generateStaticParams). Same source as app strategies. */
export async function getStrategyIdsForStaticParams(): Promise<{ id: string }[]> {
  const strategies = await getStrategies();
  return strategies.map((s) => ({ id: String(s.strategyId) }));
}

/** Fetch a specific strategy by ID – GET /api/strategies/:id */
export async function getStrategyById(id: string): Promise<Strategy | null> {
  try {
    const res = await apiFetch<ApiOk<Strategy>>(`/strategies/${id}`, { method: 'GET' });
    return res.data ?? null;
  } catch {
    return null;
  }
}

/** Referral details for current user (GET /api/referral/me) */
export type ReferralDetails = {
  referralCode: string;
  referralLink: string;
  refereesCount: number;
  value: string;
  totalFeesGenerated: string;
  ranking: number | null;
  totalYieldsEarned: string;
  yieldsByBond?: { bondName: string; amount: string }[];
};

/** Leaderboard entry (GET /api/referral/leaderboard) */
export type LeaderboardEntry = {
  id: string;
  rank: number;
  userName: string;
  referralDate: string;
  referralCount: number;
  earnings: number;
  avatar?: string;
  icon?: 'gold' | 'silver' | 'bronze';
};

/** Period for referral stats: 1m, 1y, all (GET /api/referral/me?period=). Only affects refereesCount, value, totalFeesGenerated, ranking. */
export type ReferralDetailsPeriod = '1m' | '1y' | 'all';

export async function getReferralDetails(
  token: string | null,
  period?: ReferralDetailsPeriod
): Promise<ReferralDetails | null> {
  if (!token) return null;
  try {
    const path = period ? `/referral/me?period=${encodeURIComponent(period)}` : '/referral/me';
    const res = await apiFetch<ApiOk<ReferralDetails>>(path, { method: 'GET', token });
    return res.data;
  } catch {
    return null;
  }
}

export async function getLeaderboard(token: string | null, limit = 10): Promise<LeaderboardEntry[]> {
  if (!token) return [];
  try {
    const res = await apiFetch<ApiOk<LeaderboardEntry[]>>(
      `/referral/leaderboard?limit=${Math.min(100, Math.max(1, limit))}`,
      { method: 'GET', token }
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** Fees over time period for charts (GET /api/referral/fees-over-time) */
export type ReferralFeesOverTimePeriod = '1m' | '1y' | 'all';

export type ReferralFeesOverTimePoint = {
  referralId: string;
  amount: number;
  /** Referee display name from backend. */
  userName?: string;
};

export async function getReferralFeesOverTime(
  token: string | null,
  period: ReferralFeesOverTimePeriod
): Promise<ReferralFeesOverTimePoint[]> {
  if (!token) return [];
  try {
    const res = await apiFetch<ApiOk<ReferralFeesOverTimePoint[]>>(
      `/referral/fees-over-time?period=${encodeURIComponent(period)}`,
      { method: 'GET', token }
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** Activity summary for a period (GET /api/referral/activity-summary) */
export type ReferralActivitySummaryPeriod = '1m' | '1y' | 'all';

export type ReferralActivitySummary = {
  refereesCount: number;
  value: string;
  totalFeesGenerated: string;
  ranking: number | null;
  totalYieldsEarned: string;
  yieldsByBond: { bondName: string; amount: string }[];
};

export async function getReferralActivitySummary(
  token: string | null,
  period: ReferralActivitySummaryPeriod
): Promise<ReferralActivitySummary | null> {
  if (!token) return null;
  try {
    const res = await apiFetch<ApiOk<ReferralActivitySummary>>(
      `/referral/activity-summary?period=${encodeURIComponent(period)}`,
      { method: 'GET', token }
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

/** Create deposit (NowPayments crypto) – POST /api/wallet/deposit. Same shape as invest for modal reuse. */
export type CreateDepositResponse = {
  paymentId: string;
  orderId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  /** Network name from NowPayments (e.g. Ethereum, Solana) */
  currencyNetwork?: string;
  /** Symbol from NowPayments (e.g. USDT, SOL) */
  currencySymbol?: string;
  priceAmount: number;
  priceCurrency: string;
  status: string;
  /** ISO date string from NowPayments (payment created_at); used for expire countdown */
  createdAt?: string;
};

export async function createDeposit(
  token: string | null,
  payload: { amount: number; payCurrency: string }
): Promise<CreateDepositResponse> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<CreateDepositResponse>>('/wallet/deposit', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
  return res.data;
}

/** Record a direct Web3 wallet deposit – POST /api/wallet/web3-deposit */
export type CreateWeb3DepositResponse = {
  depositId: string;
  orderId: string;
  txHash: string;
  amount: number;
  status: string;
};

export async function createWeb3Deposit(
  token: string | null,
  payload: { amount: number; currency: string; txHash: string; fromAddress: string }
): Promise<CreateWeb3DepositResponse> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<CreateWeb3DepositResponse>>('/wallet/web3-deposit', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
  return res.data;
}

/** Confirm a direct Web3 deposit on-chain – POST /api/wallet/web3-deposit-confirm */
export type ConfirmWeb3DepositResponse = {
  depositId: string;
  status: string;
  amount: number;
  message?: string;
};

export async function confirmWeb3Deposit(
  token: string | null,
  payload: { txHash: string }
): Promise<ConfirmWeb3DepositResponse> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<ConfirmWeb3DepositResponse>>('/wallet/web3-deposit-confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
  return res.data;
}

/** Deposit list item returned by GET /api/wallet/deposits */
export type DepositListItem = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  payCurrency: string;
  status: string;
  rawStatus: string;
  method: string;
  txHash: string | null;
  transactionLink: string | null;
  paymentLink: string | null;
  createdAt: string;
};

/** GET /api/wallet/deposits – list all user deposits */
export async function getDeposits(
  token: string | null
): Promise<{ list: DepositListItem[]; totalDeposited: number }> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<{ list: DepositListItem[]; totalDeposited: number }>>('/wallet/deposits', {
    token,
  });
  return res.data;
}

/** Create a NowPayments invoice (Web3 wallet deposit) – POST /api/wallet/deposit-invoice */
export type CreateInvoiceResponse = {
  invoiceId: string;
  invoiceUrl: string;
  orderId: string;
  amount: number;
};

export async function createDepositInvoice(
  token: string | null,
  payload: { amount: number }
): Promise<CreateInvoiceResponse> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<CreateInvoiceResponse>>('/wallet/deposit-invoice', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
  return res.data;
}

/** Payment order data (deposit modal / legacy invest modal share this shape). */
export type CreateInvestResponse = CreateDepositResponse;

/** Subscription created from deposited balance – POST /api/wallet/subscribe */
export type CreateSubscriptionResponse = {
  id: string;
  strategyId: string;
  amount: number;
  status: string;
  strategySnapshot?: { name?: string; type?: string; termMonths?: number; apy?: number; payoutFrequency?: string };
  createdAt?: string;
};

export type CreateSubscriptionPayload = {
  strategyId: string;
  amount: number;
  strategy?: {
    name?: string;
    type?: string;
    termMonths?: number;
    apy?: number;
    payoutFrequency?: string;
  };
};

export async function createSubscription(
  token: string | null,
  payload: CreateSubscriptionPayload
): Promise<CreateSubscriptionResponse> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<CreateSubscriptionResponse>>('/wallet/subscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
  return res.data;
}

/** List user subscriptions – GET /api/wallet/subscriptions */
export type SubscriptionListItem = {
  id: string;
  strategyId: string;
  amount: number;
  status: string;
  strategySnapshot?: { name?: string; type?: string; termMonths?: number; apy?: number; payoutFrequency?: string };
  createdAt?: string;
};

export async function getSubscriptions(token: string | null): Promise<SubscriptionListItem[]> {
  if (!token) return [];
  try {
    const res = await apiFetch<ApiOk<SubscriptionListItem[]>>('/wallet/subscriptions', { method: 'GET', token });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/**
 * Save subscription confirmation PDF on server and create document record – POST /api/wallet/save-subscription-pdf
 */
export type SaveSubscriptionPDFPayload = {
  strategyId: string;
  amount: number;
  strategy?: {
    title?: string;
    fundSize?: string;
    sector?: string;
  };
  investorName: string;
  accountId: string;
};

export async function saveSubscriptionPDF(
  token: string | null,
  payload: SaveSubscriptionPDFPayload
): Promise<{ documentId: string; fileName: string; title: string; createdAt: string }> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<{ documentId: string; fileName: string; title: string; createdAt: string }>>(
    '/wallet/save-subscription-pdf',
    { method: 'POST', body: JSON.stringify(payload), token }
  );
  return res.data;
}

/**
 * Get user documents – GET /api/wallet/documents
 */
export type UserDocument = {
  id: string;
  type: string;
  title: string;
  fileName: string;
  fileSize?: number;
  downloadCount?: number;
  createdAt: string;
  investment?: { strategyId?: string; strategyTitle?: string; amount?: number };
  metadata?: Record<string, unknown>;
};

export async function getUserDocuments(token: string | null): Promise<UserDocument[]> {
  if (!token) return [];
  try {
    const res = await apiFetch<ApiOk<UserDocument[]>>('/wallet/documents', { method: 'GET', token });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** Create fiat deposit (NowPayments fiat on-ramp) – POST /api/wallet/deposit-fiat. Returns payment link to redirect. */
export type CreateFiatDepositResponse = {
  paymentId: string;
  orderId: string;
  paymentLink: string | null;
  priceAmount: number;
  priceCurrency: string;
  status: string;
};

export async function createFiatDeposit(
  token: string | null,
  payload: { amount: number }
): Promise<CreateFiatDepositResponse> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<CreateFiatDepositResponse>>('/wallet/deposit-fiat', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
  return res.data;
}

/** Get NowPayments fiat/invoice service fee as decimal (e.g. 0.005 = 0.5%) – GET /api/wallet/fiat-fee */
export async function getFiatFeePercent(): Promise<number> {
  try {
    const res = await apiFetch<ApiOk<{ feePercent: number }>>('/wallet/fiat-fee', { method: 'GET' });
    const v = res.data?.feePercent;
    return typeof v === 'number' && v >= 0 && v <= 1 ? v : 0.005;
  } catch {
    return 0.005;
  }
}

/** Get minimum deposit amount (USD) from NowPayments – GET /api/wallet/min-amount?payCurrency=... */
export async function getDepositMinAmount(payCurrency: string): Promise<number> {
  const res = await apiFetch<ApiOk<{ minAmount: number }>>(
    `/wallet/min-amount?payCurrency=${encodeURIComponent(payCurrency)}`,
    { method: 'GET' }
  );
  const min = res.data?.minAmount;
  return typeof min === 'number' && min > 0 ? min : 1;
}

/** Portfolio from package investments – GET /api/wallet/portfolio */
export type PortfolioData = {
  totalInvestment: number;
  interestPaid: number;
  /** Interest accrued from each investment start date to now, prorated by term */
  rewardToDate: number;
  availableBalance: number;
  unrealizedInterest: number;
  /** Weighted average annual APY (%) across investments */
  averageApy: number;
  /** Average monthly APY (%) = averageApy / 12 */
  monthlyApy: number;
  /** Simple average of monthly APY across packages: (sum of APY/12 per package) / package count */
  averageMonthlyApy: number;
  /** Dominant payout frequency: weekly | monthly | quarterly */
  displayPeriod: 'weekly' | 'monthly' | 'quarterly';
  /** Average rate in display period (%) = averageApy / 52 | 12 | 4 */
  displayRate: number;
  /** Next payout amount (sum of payouts on earliest next date, per package terms) */
  nextPayoutAmount: number;
  /** Next payout date (MM/DD/YYYY) */
  nextPayoutDate: string | null;
};

export async function getPortfolio(token: string | null): Promise<PortfolioData | null> {
  if (!token) return null;
  try {
    const res = await apiFetch<ApiOk<PortfolioData>>('/wallet/portfolio', {
      method: 'GET',
      token,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

/** Single investment item for positions list – GET /api/wallet/investments */
export type InvestmentListItem = {
  id: string;
  /** Subscription display id (5-digit style); used as assetId in assets table. */
  subid?: number;
  strategyId?: string;
  createdAt: string;
  product: string;
  period: string;
  status: string;
  amount: number;
  currency: string;
  maturityDate: string;
  /** Strategy redemption term at time of investment (e.g. "30 days", "No"). */
  redemption?: string;
  /** NowPayments payment currency (e.g. USDT, BTC) used for the order. */
  payCurrency?: string;
  /** When true, this investment will be reinvested automatically when the period ends. */
  autoReinvest?: boolean;
  /** Transaction link for crypto (block explorer); shown in TX Hash column when present. */
  transactionLink?: string;
  /** Payment link for card/fiat; shown in TX Hash column when present. */
  paymentLink?: string;
};

export type GetInvestmentsResponse = {
  list: InvestmentListItem[];
  totalCompletedInvestments: number;
};

export async function getInvestments(token: string | null): Promise<GetInvestmentsResponse> {
  if (!token) return { list: [], totalCompletedInvestments: 0 };
  try {
    const res = await apiFetch<ApiOk<InvestmentListItem[]> & { totalCompletedInvestments?: number }>(
      '/wallet/investments',
      { method: 'GET', token }
    );
    const list = Array.isArray(res.data) ? res.data : [];
    const totalCompletedInvestments =
      typeof (res as { totalCompletedInvestments?: number }).totalCompletedInvestments === 'number'
        ? (res as { totalCompletedInvestments: number }).totalCompletedInvestments
        : list.filter((i) => ['finished', 'confirmed', 'OPEN', 'CLOSING'].includes((i.status ?? '').toUpperCase())).reduce((s, i) => s + (i.amount ?? 0), 0);
    return { list, totalCompletedInvestments };
  } catch {
    return { list: [], totalCompletedInvestments: 0 };
  }
}

/** Enable auto-reinvest for a subscription (reinvested automatically when period ends). */
export async function setSubscriptionAutoReinvest(
  token: string | null,
  subscriptionId: string
): Promise<{ autoReinvest: boolean }> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<{ autoReinvest: boolean }>>(
    `/wallet/subscriptions/${encodeURIComponent(subscriptionId)}/auto-reinvest`,
    { method: 'POST', token }
  );
  return res.data;
}

/** Cancel a subscription (redeem). Sets status to cancelled; principal returns to available balance. */
export async function cancelSubscription(
  token: string | null,
  subscriptionId: string
): Promise<{ cancelled: boolean }> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<{ cancelled: boolean }>>(
    `/wallet/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    { method: 'POST', token }
  );
  return res.data;
}

/** Single withdrawal item – GET /api/wallet/withdrawals */
export type WithdrawalListItem = {
  id: string;
  createdAt: string;
  amount: number;
  status: string;
  payCurrency: string;
  /** Transaction link for crypto; shown in TX Hash column when present. */
  transactionLink?: string;
  /** Payment link for card; shown in TX Hash column when present. */
  paymentLink?: string;
};

export async function getWithdrawals(token: string | null): Promise<WithdrawalListItem[]> {
  if (!token) return [];
  try {
    const res = await apiFetch<ApiOk<WithdrawalListItem[]>>('/wallet/withdrawals', {
      method: 'GET',
      token,
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** Get user available balance (USD) – GET /api/wallet/balance */
export async function getBalance(token: string | null): Promise<number> {
  if (!token) return 0;
  const res = await apiFetch<ApiOk<{ availableBalanceUsd: number }>>('/wallet/balance', {
    method: 'GET',
    token,
  });
  const v = res.data?.availableBalanceUsd;
  return typeof v === 'number' && v >= 0 ? v : 0;
}

/** Create withdrawal – POST /api/wallet/withdraw */
export async function createWithdraw(
  token: string | null,
  payload: { amount: number; payCurrency: string; walletAddress: string }
): Promise<{ message: string; amount: number; payCurrency: string }> {
  if (!token) throw new ApiError('Authentication required', 401);
  const res = await apiFetch<ApiOk<{ message: string; amount: number; payCurrency: string }>>('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
  return res.data;
}

