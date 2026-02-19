'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { getAdminWithdrawals, updateAdminWithdrawal } from '@/lib/adminApi';
import AdminLayout from '@/components/admin/AdminLayout';
import UserDetailModal from '@/components/admin/UserDetailModal';
import { toast } from 'react-toastify';

function formatUsd(v: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v); }
function formatDate(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}, ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
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
    getAdminWithdrawals(token, p, s).then((data) => {
      if (data) { setWithdrawals(data.withdrawals); setTotal(data.total); setPages(data.pages); setPage(data.page); }
      setLoading(false);
    });
  };

  useEffect(() => { load(1, ''); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const token = getToken();
    if (!token) return;
    const res = await updateAdminWithdrawal(token, id, newStatus);
    if (res) {
      setWithdrawals((prev) => prev.map((w) => w._id === id ? { ...w, status: newStatus } : w));
      toast.success(`Withdrawal ${newStatus}`);
    }
  };

  return (
      <AdminLayout>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold font-display text-white">Withdrawals ({total})</h2>
          <select value={status} onChange={(e) => { setStatus(e.target.value); load(1, e.target.value); }} className="bg-[#111111] border border-[#FFFFFF14] rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="bg-[#111111] rounded-xl border border-[#FFFFFF14] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#FFFFFF14] text-[#FFFFFF60] font-ui text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Currency</th>
                <th className="text-left px-4 py-3">Wallet</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#FFFFFF40] font-ui">Loading...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#FFFFFF40] font-ui">No withdrawals found</td></tr>
              ) : withdrawals.map((w) => (
                <tr key={w._id} className="border-b border-[#FFFFFF08] hover:bg-[#FFFFFF06] transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedUser(w.user?._id)} className="text-white hover:text-[#53A7FF] font-ui transition-colors text-left">
                      {w.user?.firstName} {w.user?.lastName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-white font-ui font-medium">{formatUsd(w.amount)}</td>
                  <td className="px-4 py-3 text-[#FFFFFF60] font-ui">{w.payCurrency}</td>
                  <td className="px-4 py-3 text-[#FFFFFF60] font-ui text-xs max-w-[120px] truncate">{w.walletAddress}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                  <td className="px-4 py-3 text-[#FFFFFF40] font-ui text-xs">{formatDate(w.createdAt)}</td>
                  <td className="px-4 py-3">
                    {w.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleStatusChange(w._id, 'completed')} className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors font-ui">Approve</button>
                        <button onClick={() => handleStatusChange(w._id, 'failed')} className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors font-ui">Reject</button>
                      </div>
                    )}
                  </td>
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
    completed: 'bg-green-500/20 text-green-400', pending: 'bg-yellow-500/20 text-yellow-400', failed: 'bg-red-500/20 text-red-400',
  };
  return <span className={`text-[10px] font-ui px-2 py-0.5 rounded-full ${colors[status] || 'bg-[#FFFFFF14] text-[#FFFFFF60]'}`}>{status}</span>;
}
