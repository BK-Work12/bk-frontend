'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { getAdminUsers } from '@/lib/adminApi';
import AdminLayout from '@/components/admin/AdminLayout';
import UserDetailModal from '@/components/admin/UserDetailModal';

function formatDate(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const load = (p: number, s: string) => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    getAdminUsers(token, p, s).then((data) => {
      if (data) { setUsers(data.users); setTotal(data.total); setPages(data.pages); setPage(data.page); }
      setLoading(false);
    });
  };

  useEffect(() => { load(1, ''); }, []);

  const handleSearch = () => { load(1, search); };

  return (
      <AdminLayout>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold font-display text-white">Users ({total})</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-[#111111] border border-[#FFFFFF14] rounded-lg px-3 py-2 text-sm text-white font-ui w-60 focus:outline-none focus:border-[#FFFFFF40]"
            />
            <button onClick={handleSearch} className="bg-[#FFFFFF14] hover:bg-[#FFFFFF20] text-white text-sm font-ui px-4 py-2 rounded-lg transition-colors">Search</button>
          </div>
        </div>

        <div className="bg-[#111111] rounded-xl border border-[#FFFFFF14] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#FFFFFF14] text-[#FFFFFF60] font-ui text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">KYC</th>
                <th className="text-left px-4 py-3">Country</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#FFFFFF40] font-ui">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#FFFFFF40] font-ui">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b border-[#FFFFFF08] hover:bg-[#FFFFFF06] transition-colors">
                    <td className="px-4 py-3 text-white font-ui">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-[#FFFFFF80] font-ui">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-[#F5FF1E20] text-[#F5FF1E]' : 'bg-[#FFFFFF14] text-[#FFFFFF60]'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.verificationStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                        u.verificationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        u.verificationStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-[#FFFFFF14] text-[#FFFFFF40]'
                      }`}>
                        {u.verificationStatus || 'none'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#FFFFFF60] font-ui">{u.country || '—'}</td>
                    <td className="px-4 py-3 text-[#FFFFFF40] font-ui text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedUser(u._id)} className="text-xs text-[#53A7FF] hover:underline font-ui">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button disabled={page <= 1} onClick={() => load(page - 1, search)} className="px-3 py-1.5 text-sm bg-[#FFFFFF14] text-white rounded-lg disabled:opacity-30 hover:bg-[#FFFFFF20] transition-colors font-ui">Prev</button>
            <span className="px-3 py-1.5 text-sm text-[#FFFFFF60] font-ui">Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => load(page + 1, search)} className="px-3 py-1.5 text-sm bg-[#FFFFFF14] text-white rounded-lg disabled:opacity-30 hover:bg-[#FFFFFF20] transition-colors font-ui">Next</button>
          </div>
        )}

        {/* User detail modal */}
        {selectedUser && (
          <UserDetailModal userId={selectedUser} onClose={() => { setSelectedUser(null); load(page, search); }} />
        )}
      </AdminLayout>
  );
}
