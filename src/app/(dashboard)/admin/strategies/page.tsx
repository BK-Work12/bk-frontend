'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { getAdminStrategies, updateAdminStrategy, deleteAdminStrategy, createAdminStrategy } from '@/lib/adminApi';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';

function formatUsd(v: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v); }

export default function AdminStrategiesPage() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const load = () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    getAdminStrategies(token).then((data) => { if (data) setStrategies(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (s: any) => {
    setEditing(s._id);
    setEditData({ apy: s.apy, minInvestment: s.minInvestment, cap: s.cap, filled: s.filled, type: s.type, payoutFrequency: s.payoutFrequency });
  };

  const handleSave = async (id: string) => {
    const token = getToken();
    if (!token) return;
    const res = await updateAdminStrategy(token, id, editData);
    if (res) { toast.success('Strategy updated'); setEditing(null); load(); }
    else toast.error('Failed to update');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    const token = getToken();
    if (!token) return;
    const ok = await deleteAdminStrategy(token, id);
    if (ok) { toast.success('Strategy deleted'); load(); }
    else toast.error('Failed to delete');
  };

  return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-white">Strategies ({strategies.length})</h2>
        </div>

        <div className="bg-[#111111] rounded-xl border border-[#FFFFFF14] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#FFFFFF14] text-[#FFFFFF60] font-ui text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">APY</th>
                <th className="text-left px-4 py-3">Term</th>
                <th className="text-left px-4 py-3">Min</th>
                <th className="text-left px-4 py-3">Payout</th>
                <th className="text-left px-4 py-3">Cap</th>
                <th className="text-left px-4 py-3">Filled</th>
                <th className="text-left px-4 py-3">Group</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-[#FFFFFF40] font-ui">Loading...</td></tr>
              ) : strategies.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-[#FFFFFF40] font-ui">No strategies found</td></tr>
              ) : strategies.map((s) => (
                <tr key={s._id} className="border-b border-[#FFFFFF08] hover:bg-[#FFFFFF06] transition-colors">
                  <td className="px-4 py-3 text-[#FFFFFF60] font-ui">{s.strategyId}</td>
                  <td className="px-4 py-3 text-white font-ui font-medium">{s.name}</td>
                  <td className="px-4 py-3">
                    {editing === s._id ? (
                      <select value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })} className="bg-[#0a0a0a] border border-[#FFFFFF14] rounded px-2 py-1 text-xs text-white font-ui w-20">
                        <option value="fixed">fixed</option>
                        <option value="flexible">flexible</option>
                        <option value="sold">sold</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.type === 'fixed' ? 'bg-green-500/20 text-green-400' : s.type === 'flexible' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#FFFFFF14] text-[#FFFFFF40]'}`}>{s.type}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === s._id ? (
                      <input type="number" step="0.1" value={editData.apy} onChange={(e) => setEditData({ ...editData, apy: parseFloat(e.target.value) })} className="bg-[#0a0a0a] border border-[#FFFFFF14] rounded px-2 py-1 text-xs text-white font-ui w-16" />
                    ) : (
                      <span className="text-[#8EDD23] font-ui">{s.apy}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#FFFFFF60] font-ui">{s.termMonths}m</td>
                  <td className="px-4 py-3">
                    {editing === s._id ? (
                      <input type="number" value={editData.minInvestment} onChange={(e) => setEditData({ ...editData, minInvestment: parseFloat(e.target.value) })} className="bg-[#0a0a0a] border border-[#FFFFFF14] rounded px-2 py-1 text-xs text-white font-ui w-20" />
                    ) : (
                      <span className="text-[#FFFFFF60] font-ui">{formatUsd(s.minInvestment)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === s._id ? (
                      <select value={editData.payoutFrequency} onChange={(e) => setEditData({ ...editData, payoutFrequency: e.target.value })} className="bg-[#0a0a0a] border border-[#FFFFFF14] rounded px-2 py-1 text-xs text-white font-ui w-24">
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    ) : (
                      <span className="text-[#FFFFFF60] font-ui">{s.payoutFrequency}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === s._id ? (
                      <input type="number" value={editData.cap} onChange={(e) => setEditData({ ...editData, cap: parseFloat(e.target.value) })} className="bg-[#0a0a0a] border border-[#FFFFFF14] rounded px-2 py-1 text-xs text-white font-ui w-24" />
                    ) : (
                      <span className="text-[#FFFFFF60] font-ui">{formatUsd(s.cap)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#FFFFFF60] font-ui">{formatUsd(s.filled)}</td>
                  <td className="px-4 py-3 text-[#FFFFFF40] font-ui text-xs">{s.groupTitle}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {editing === s._id ? (
                        <>
                          <button onClick={() => handleSave(s._id)} className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors font-ui">Save</button>
                          <button onClick={() => setEditing(null)} className="text-[10px] px-2 py-1 bg-[#FFFFFF14] text-[#FFFFFF60] rounded hover:bg-[#FFFFFF20] transition-colors font-ui">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(s)} className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors font-ui">Edit</button>
                          <button onClick={() => handleDelete(s._id)} className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors font-ui">Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminLayout>
  );
}
