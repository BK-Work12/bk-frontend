'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { getAdminUser, updateAdminUser, creditAdminUser } from '@/lib/adminApi';
import { toast } from 'react-toastify';

function formatUsd(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);
}
function formatDate(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}, ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

export default function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [crediting, setCrediting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token || !userId) return;
    setLoading(true);
    getAdminUser(token, userId).then((d) => { setData(d); setLoading(false); });
  }, [userId]);

  const handleRoleChange = async (role: string) => {
    const token = getToken();
    if (!token) return;
    const res = await updateAdminUser(token, userId, { role });
    if (res) { setData((prev: any) => ({ ...prev, user: res })); toast.success('Role updated'); }
  };

  const handleVerificationChange = async (status: string) => {
    const token = getToken();
    if (!token) return;
    const res = await updateAdminUser(token, userId, { verificationStatus: status });
    if (res) { setData((prev: any) => ({ ...prev, user: res })); toast.success('Verification status updated'); }
  };

  const handleCredit = async () => {
    const amt = parseFloat(creditAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    const token = getToken();
    if (!token) return;
    setCrediting(true);
    const res = await creditAdminUser(token, userId, amt, creditNote);
    setCrediting(false);
    if (res) {
      toast.success(res.message || `$${amt.toFixed(2)} credited`);
      setCreditAmount('');
      setCreditNote('');
      // Reload user data
      getAdminUser(token, userId).then((d) => { if (d) setData(d); });
    } else {
      toast.error('Failed to credit user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111111] border border-[#FFFFFF14] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#FFFFFF14]">
          <h2 className="text-lg font-bold font-ui text-white">User Details</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FFFFFF14] hover:bg-[#FFFFFF20] transition-colors">
            <span className="text-white text-sm">&times;</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#FFFFFF60] font-ui">Loading...</div>
        ) : !data ? (
          <div className="p-8 text-center text-red-400 font-ui">User not found</div>
        ) : (
          <div className="p-5">
            {/* User Info + Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
              <div className="lg:col-span-2">
                <h3 className="text-base font-bold font-ui text-white mb-3">{data.user.firstName} {data.user.lastName}</h3>
                <div className="grid grid-cols-2 gap-2.5 text-sm">
                  <Field label="Email" value={data.user.email} />
                  <Field label="Phone" value={data.user.phone || '—'} />
                  <Field label="Country" value={data.user.country || '—'} />
                  <Field label="Date of Birth" value={data.user.dateOfBirth || '—'} />
                  <Field label="Address" value={[data.user.addressLine1, data.user.city, data.user.postCode].filter(Boolean).join(', ') || '—'} />
                  <Field label="Wallet" value={data.user.walletAddress ? `${data.user.walletAddress.slice(0, 16)}...` : '—'} />
                  <Field label="Network" value={data.user.preferredNetwork || '—'} />
                  <Field label="Referral Code" value={data.user.referralCode || '—'} />
                  <Field label="Joined" value={formatDate(data.user.createdAt)} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-[#FFFFFF60] font-ui block mb-1">Role</label>
                  <select value={data.user.role || 'user'} onChange={(e) => handleRoleChange(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#FFFFFF14] rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#FFFFFF60] font-ui block mb-1">KYC Verification</label>
                  <select value={data.user.verificationStatus || 'none'} onChange={(e) => handleVerificationChange(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#FFFFFF14] rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none">
                    <option value="none">None</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Credit/Add Balance Section */}
            <div className="mb-5 p-4 bg-[#0a0a0a] rounded-xl border border-[#FFFFFF14]">
              <h4 className="text-sm font-bold font-ui text-white mb-3">Add Credits / Balance</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Amount (USD)"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-full bg-[#111111] border border-[#FFFFFF14] rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none focus:border-[#8EDD23]"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={creditNote}
                    onChange={(e) => setCreditNote(e.target.value)}
                    className="w-full bg-[#111111] border border-[#FFFFFF14] rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none focus:border-[#FFFFFF40]"
                  />
                </div>
                <button
                  onClick={handleCredit}
                  disabled={crediting || !creditAmount}
                  className="px-5 py-2 bg-[#8EDD23] text-black text-sm font-bold font-ui rounded-lg hover:bg-[#9FEE34] disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  {crediting ? 'Adding...' : 'Add Credit'}
                </button>
              </div>
            </div>

            {/* Deposits */}
            <MiniTable title="Deposits" count={data.deposits?.length ?? 0} headers={['Amount', 'Currency', 'Status', 'Date']}>
              {(data.deposits || []).slice(0, 10).map((d: any) => (
                <tr key={d._id} className="border-b border-[#FFFFFF08] text-sm">
                  <td className="px-3 py-2 text-white font-ui">{formatUsd(d.amount)}</td>
                  <td className="px-3 py-2 text-[#FFFFFF60] font-ui">{d.payCurrency === 'admin_credit' ? 'Admin Credit' : d.payCurrency}</td>
                  <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                  <td className="px-3 py-2 text-[#FFFFFF40] font-ui text-xs">{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </MiniTable>

            {/* Subscriptions */}
            <MiniTable title="Subscriptions" count={data.subscriptions?.length ?? 0} headers={['Amount', 'Strategy', 'APY', 'Status', 'Date']}>
              {(data.subscriptions || []).slice(0, 10).map((s: any) => (
                <tr key={s._id} className="border-b border-[#FFFFFF08] text-sm">
                  <td className="px-3 py-2 text-white font-ui">{formatUsd(s.amount)}</td>
                  <td className="px-3 py-2 text-[#FFFFFF60] font-ui">{s.strategySnapshot?.name || '—'}</td>
                  <td className="px-3 py-2 text-[#8EDD23] font-ui">{s.strategySnapshot?.apy ?? '—'}%</td>
                  <td className="px-3 py-2"><StatusBadge status={s.status} /></td>
                  <td className="px-3 py-2 text-[#FFFFFF40] font-ui text-xs">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </MiniTable>

            {/* Withdrawals */}
            <MiniTable title="Withdrawals" count={data.withdrawals?.length ?? 0} headers={['Amount', 'Currency', 'Wallet', 'Status', 'Date']}>
              {(data.withdrawals || []).slice(0, 10).map((w: any) => (
                <tr key={w._id} className="border-b border-[#FFFFFF08] text-sm">
                  <td className="px-3 py-2 text-white font-ui">{formatUsd(w.amount)}</td>
                  <td className="px-3 py-2 text-[#FFFFFF60] font-ui">{w.payCurrency}</td>
                  <td className="px-3 py-2 text-[#FFFFFF60] font-ui text-xs">{w.walletAddress?.slice(0, 12)}...</td>
                  <td className="px-3 py-2"><StatusBadge status={w.status} /></td>
                  <td className="px-3 py-2 text-[#FFFFFF40] font-ui text-xs">{formatDate(w.createdAt)}</td>
                </tr>
              ))}
            </MiniTable>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-[#FFFFFF40] font-ui uppercase tracking-wider">{label}</span>
      <div className="text-white font-ui text-sm mt-0.5">{value}</div>
    </div>
  );
}

function MiniTable({ title, count, headers, children }: { title: string; count: number; headers: string[]; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div className="mb-4">
      <h4 className="text-sm font-bold font-ui text-white mb-2">{title} ({count})</h4>
      <div className="bg-[#0a0a0a] rounded-lg border border-[#FFFFFF0A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#FFFFFF0A] text-[#FFFFFF40] font-ui text-[10px] uppercase tracking-wider">
              {headers.map((h) => <th key={h} className="text-left px-3 py-1.5">{h}</th>)}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    finished: 'bg-green-500/20 text-green-400', completed: 'bg-green-500/20 text-green-400', active: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400', waiting: 'bg-yellow-500/20 text-yellow-400',
    confirming: 'bg-blue-500/20 text-blue-400', failed: 'bg-red-500/20 text-red-400', expired: 'bg-red-500/20 text-red-400',
  };
  return <span className={`text-[10px] font-ui px-2 py-0.5 rounded-full ${colors[status] || 'bg-[#FFFFFF14] text-[#FFFFFF60]'}`}>{status}</span>;
}
