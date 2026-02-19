import { apiFetch, type ApiOk } from './api';

/* ─── Types ─── */

export type AdminStats = {
  users: { total: number };
  deposits: { total: number; pending: number };
  withdrawals: { total: number; pending: number };
  subscriptions: { total: number; active: number };
  totalInvested: number;
  recentUsers: any[];
  recentDeposits: any[];
  recentWithdrawals: any[];
};

export type Paginated<T> = {
  total: number;
  page: number;
  limit: number;
  pages: number;
} & T;

/* ─── Stats ─── */

export async function getAdminStats(token: string): Promise<AdminStats | null> {
  try {
    const res = await apiFetch<ApiOk<AdminStats>>('/admin/stats', { token });
    return res.data ?? null;
  } catch { return null; }
}

/* ─── Users ─── */

export async function getAdminUsers(token: string, page = 1, search = ''): Promise<Paginated<{ users: any[] }> | null> {
  try {
    const q = new URLSearchParams({ page: String(page), limit: '20', ...(search ? { search } : {}) });
    const res = await apiFetch<ApiOk<Paginated<{ users: any[] }>>>(`/admin/users?${q}`, { token });
    return res.data ?? null;
  } catch { return null; }
}

export async function getAdminUser(token: string, id: string): Promise<any | null> {
  try {
    const res = await apiFetch<ApiOk<any>>(`/admin/users/${id}`, { token });
    return res.data ?? null;
  } catch { return null; }
}

export async function updateAdminUser(token: string, id: string, data: Record<string, any>): Promise<any | null> {
  try {
    const res = await apiFetch<ApiOk<any>>(`/admin/users/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) });
    return res.data ?? null;
  } catch { return null; }
}

/* ─── Credit User ─── */

export async function creditAdminUser(token: string, userId: string, amount: number, note = ''): Promise<any | null> {
  try {
    const res = await apiFetch<ApiOk<any>>(`/admin/users/${userId}/credit`, { method: 'POST', token, body: JSON.stringify({ amount, note }) });
    return res;
  } catch { return null; }
}

/* ─── Deposits ─── */

export async function getAdminDeposits(token: string, page = 1, status = ''): Promise<Paginated<{ deposits: any[] }> | null> {
  try {
    const q = new URLSearchParams({ page: String(page), limit: '20', ...(status ? { status } : {}) });
    const res = await apiFetch<ApiOk<Paginated<{ deposits: any[] }>>>(`/admin/deposits?${q}`, { token });
    return res.data ?? null;
  } catch { return null; }
}

/* ─── Withdrawals ─── */

export async function getAdminWithdrawals(token: string, page = 1, status = ''): Promise<Paginated<{ withdrawals: any[] }> | null> {
  try {
    const q = new URLSearchParams({ page: String(page), limit: '20', ...(status ? { status } : {}) });
    const res = await apiFetch<ApiOk<Paginated<{ withdrawals: any[] }>>>(`/admin/withdrawals?${q}`, { token });
    return res.data ?? null;
  } catch { return null; }
}

export async function updateAdminWithdrawal(token: string, id: string, status: string): Promise<any | null> {
  try {
    const res = await apiFetch<ApiOk<any>>(`/admin/withdrawals/${id}`, { method: 'PATCH', token, body: JSON.stringify({ status }) });
    return res.data ?? null;
  } catch { return null; }
}

/* ─── Subscriptions ─── */

export async function getAdminSubscriptions(token: string, page = 1, status = ''): Promise<Paginated<{ subscriptions: any[] }> | null> {
  try {
    const q = new URLSearchParams({ page: String(page), limit: '20', ...(status ? { status } : {}) });
    const res = await apiFetch<ApiOk<Paginated<{ subscriptions: any[] }>>>(`/admin/subscriptions?${q}`, { token });
    return res.data ?? null;
  } catch { return null; }
}

/* ─── Strategies ─── */

export async function getAdminStrategies(token: string): Promise<any[] | null> {
  try {
    const res = await apiFetch<ApiOk<any[]>>('/admin/strategies', { token });
    return res.data ?? null;
  } catch { return null; }
}

export async function createAdminStrategy(token: string, data: Record<string, any>): Promise<any | null> {
  try {
    const res = await apiFetch<ApiOk<any>>('/admin/strategies', { method: 'POST', token, body: JSON.stringify(data) });
    return res.data ?? null;
  } catch { return null; }
}

export async function updateAdminStrategy(token: string, id: string, data: Record<string, any>): Promise<any | null> {
  try {
    const res = await apiFetch<ApiOk<any>>(`/admin/strategies/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) });
    return res.data ?? null;
  } catch { return null; }
}

export async function deleteAdminStrategy(token: string, id: string): Promise<boolean> {
  try {
    await apiFetch<ApiOk<any>>(`/admin/strategies/${id}`, { method: 'DELETE', token });
    return true;
  } catch { return false; }
}

/* ─── Notifications ─── */

export type AdminNotification = {
  id: string;
  type: 'new_user' | 'new_deposit' | 'new_subscription';
  title: string;
  message: string;
  relatedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  relatedId?: string;
  meta?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

export type AdminNotificationsResponse = {
  notifications: AdminNotification[];
  total: number;
  page: number;
  pages: number;
  unreadCount: number;
};

export async function getAdminNotifications(
  token: string,
  page = 1,
  limit = 20,
  unreadOnly = false,
): Promise<AdminNotificationsResponse | null> {
  try {
    const qs = `?page=${page}&limit=${limit}${unreadOnly ? '&unreadOnly=true' : ''}`;
    const res = await apiFetch<ApiOk<AdminNotificationsResponse>>(`/admin/notifications${qs}`, { token });
    return res.data ?? null;
  } catch { return null; }
}

export async function getAdminUnreadCount(token: string): Promise<number> {
  try {
    const res = await apiFetch<ApiOk<{ unreadCount: number }>>('/admin/notifications/unread-count', { token });
    return res.data?.unreadCount ?? 0;
  } catch { return 0; }
}

export async function markNotificationRead(token: string, id: string): Promise<boolean> {
  try {
    await apiFetch<ApiOk<any>>(`/admin/notifications/${id}/read`, { method: 'PATCH', token });
    return true;
  } catch { return false; }
}

export async function markAllNotificationsRead(token: string): Promise<boolean> {
  try {
    await apiFetch<ApiOk<any>>('/admin/notifications/read-all', { method: 'PATCH', token });
    return true;
  } catch { return false; }
}
