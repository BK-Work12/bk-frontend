'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { getAdminStats, type AdminStats } from '@/lib/adminApi';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

function formatUsd(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);
}
function formatDate(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getAdminStats(token).then((d) => { setStats(d); setLoading(false); });
  }, []);

  return (
      <AdminLayout>
        <h2 className="text-2xl font-bold font-display text-white mb-6">Dashboard Overview</h2>

        {loading ? (
          <div className="text-[#FFFFFF60] font-ui">Loading stats...</div>
        ) : !stats ? (
          <div className="text-red-400 font-ui">Failed to load stats. Make sure you have admin access.</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <StatCard label="Total Users" value={String(stats.users.total)} color="#8EDD23" />
              <StatCard label="Total Deposits" value={formatUsd(stats.deposits.total)} sub={`${stats.deposits.pending} pending`} color="#53A7FF" />
              <StatCard label="Total Withdrawals" value={formatUsd(stats.withdrawals.total)} sub={`${stats.withdrawals.pending} pending`} color="#9274F3" />
              <StatCard label="Active Investments" value={formatUsd(stats.totalInvested)} sub={`${stats.subscriptions.active} active / ${stats.subscriptions.total} total`} color="#F5FF1E" />
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recent Users */}
              <div className="bg-[#111111] rounded-xl p-4 border border-[#FFFFFF14]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold font-ui text-white">Recent Users</h3>
                  <Link href="/admin/users" className="text-xs font-ui text-[#8EDD23] hover:underline">View All</Link>
                </div>
                <div className="flex flex-col gap-2">
                  {stats.recentUsers.map((u: any) => (
                    <div key={u._id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-white font-ui">{u.firstName} {u.lastName}</span>
                        <span className="text-[#FFFFFF60] font-ui ml-2 text-xs">{u.email}</span>
                      </div>
                      <span className="text-xs text-[#FFFFFF40] font-ui">{formatDate(u.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Deposits */}
              <div className="bg-[#111111] rounded-xl p-4 border border-[#FFFFFF14]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold font-ui text-white">Recent Deposits</h3>
                  <Link href="/admin/deposits" className="text-xs font-ui text-[#53A7FF] hover:underline">View All</Link>
                </div>
                <div className="flex flex-col gap-2">
                  {stats.recentDeposits.map((d: any) => (
                    <div key={d._id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-white font-ui">{d.user?.firstName} {d.user?.lastName}</span>
                        <span className="text-[#FFFFFF60] font-ui ml-2 text-xs">{formatUsd(d.amount)}</span>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                  {stats.recentDeposits.length === 0 && <span className="text-[#FFFFFF40] text-sm font-ui">No deposits yet</span>}
                </div>
              </div>

              {/* Recent Withdrawals */}
              <div className="bg-[#111111] rounded-xl p-4 border border-[#FFFFFF14]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold font-ui text-white">Recent Withdrawals</h3>
                  <Link href="/admin/withdrawals" className="text-xs font-ui text-[#9274F3] hover:underline">View All</Link>
                </div>
                <div className="flex flex-col gap-2">
                  {stats.recentWithdrawals.map((w: any) => (
                    <div key={w._id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-white font-ui">{w.user?.firstName} {w.user?.lastName}</span>
                        <span className="text-[#FFFFFF60] font-ui ml-2 text-xs">{formatUsd(w.amount)}</span>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>
                  ))}
                  {stats.recentWithdrawals.length === 0 && <span className="text-[#FFFFFF40] text-sm font-ui">No withdrawals yet</span>}
                </div>
              </div>
            </div>
          </>
        )}
      </AdminLayout>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-[#111111] rounded-xl p-4 border border-[#FFFFFF14]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-ui text-[#FFFFFF60] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl lg:text-2xl font-bold font-display text-white">{value}</div>
      {sub && <div className="text-xs font-ui text-[#FFFFFF40] mt-1">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    finished: 'bg-green-500/20 text-green-400',
    completed: 'bg-green-500/20 text-green-400',
    active: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    waiting: 'bg-yellow-500/20 text-yellow-400',
    confirming: 'bg-blue-500/20 text-blue-400',
    failed: 'bg-red-500/20 text-red-400',
    expired: 'bg-red-500/20 text-red-400',
    refunded: 'bg-orange-500/20 text-orange-400',
  };
  return (
    <span className={`text-[10px] font-ui px-2 py-0.5 rounded-full ${colors[status] || 'bg-[#FFFFFF14] text-[#FFFFFF60]'}`}>
      {status}
    </span>
  );
}
