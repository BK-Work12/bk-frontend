'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { getAdminSubscriptions } from '@/lib/adminApi';
import AdminLayout from '@/components/admin/AdminLayout';
import UserDetailModal from '@/components/admin/UserDetailModal';

function formatUsd(v: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v); }
function formatDate(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}, ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const load = (p: number, s: string) => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    getAdminSubscriptions(token, p, s).then((data) => {
      if (data) { setSubs(data.subscriptions); setTotal(data.total); setPages(data.pages); setPage(data.page); }
      setLoading(false);
    });
  };

  useEffect(() => { load(1, ''); }, []);

  return (
      <AdminLayout>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold font-display text-white">Subscriptions ({total})</h2>
          <select value={status} onChange={(e) => { setStatus(e.target.value); load(1, e.target.value); }} className="bg-[#111111] border border-[#FFFFFF14] rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="matured">Matured</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-[#111111] rounded-xl border border-[#FFFFFF14] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#FFFFFF14] text-[#FFFFFF60] font-ui text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Strategy</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">APY</th>
                <th className="text-left px-4 py-3">Term</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#FFFFFF40] font-ui">Loading...</td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#FFFFFF40] font-ui">No subscriptions found</td></tr>
              ) : subs.map((s) => (
                <tr key={s._id} className="border-b border-[#FFFFFF08] hover:bg-[#FFFFFF06] transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedUser(s.user?._id)} className="text-white hover:text-[#53A7FF] font-ui transition-colors text-left">
                      {s.user?.firstName} {s.user?.lastName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-white font-ui font-medium">{formatUsd(s.amount)}</td>
                  <td className="px-4 py-3 text-[#FFFFFF60] font-ui">{s.strategySnapshot?.name || '—'}</td>
                  <td className="px-4 py-3 text-[#FFFFFF60] font-ui capitalize">{s.strategySnapshot?.type || '—'}</td>
                  <td className="px-4 py-3 text-[#8EDD23] font-ui">{s.strategySnapshot?.apy ?? '—'}%</td>
                  <td className="px-4 py-3 text-[#FFFFFF60] font-ui">{s.strategySnapshot?.termMonths ?? '—'}m</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-[#FFFFFF40] font-ui text-xs">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button disabled={page <= 1} onClick={() => load(page - 1, status)} className="px-3 py-1.5 text-sm bg-[#FFFFFF14] text-white rounded-lg disabled:opacity-30 hover:bg-[#FFFFFF20] transition-colors font-ui">Prev</button>
            <span className="px-3 py-1.5 text-sm text-[#FFFFFF60] font-ui">Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => load(page + 1, status)} className="px-3 py-1.5 text-sm bg-[#FFFFFF14] text-white rounded-lg disabled:opacity-30 hover:bg-[#FFFFFF20] transition-colors font-ui">Next</button>
          </div>
        )}

        {selectedUser && <UserDetailModal userId={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400', matured: 'bg-blue-500/20 text-blue-400', cancelled: 'bg-red-500/20 text-red-400',
  };
  return <span className={`text-[10px] font-ui px-2 py-0.5 rounded-full ${colors[status] || 'bg-[#FFFFFF14] text-[#FFFFFF60]'}`}>{status}</span>;
}
