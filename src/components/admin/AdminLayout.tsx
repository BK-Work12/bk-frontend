'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminGuard from './AdminGuard';
import NotificationBell from './NotificationBell';

const navItems = [
  { label: 'Overview', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Deposits', href: '/admin/deposits' },
  { label: 'Withdrawals', href: '/admin/withdrawals' },
  { label: 'Subscriptions', href: '/admin/subscriptions' },
  { label: 'Strategies', href: '/admin/strategies' },
  { label: 'Chat Agents', href: '/admin/chat-agents' },
  { label: 'Chat Logs', href: '/admin/chat-logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="min-h-screen">
        {/* Admin top bar */}
        <div className="border-b border-[#FFFFFF14] bg-[#0a0a0a] px-3 sm:px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-b from-[#F5FF1E] to-[#42DE33] flex items-center justify-center shrink-0">
                <span className="text-black font-bold text-xs sm:text-sm">A</span>
              </div>
              <h1 className="text-sm sm:text-lg font-bold font-ui text-white truncate">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <NotificationBell />
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-ui text-[#FFFFFF80] hover:text-white transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Admin nav */}
        <div className="border-b border-[#FFFFFF14] bg-[#0a0a0a] px-4 lg:px-8 overflow-x-auto">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 text-sm font-ui font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#8EDD23] text-white'
                      : 'border-transparent text-[#FFFFFF60] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 lg:px-8 py-6">{children}</div>
      </div>
    </AdminGuard>
  );
}
