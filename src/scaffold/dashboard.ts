import type { CLIAnswers } from '../cli.js';
import { writeFile } from '../utils/writeFile.js';

export async function scaffoldDashboard(projectDir: string, a: CLIAnswers): Promise<void> {
  // Layout
  await writeFile(projectDir, 'src/app/(dashboard)/layout.tsx',                  dashLayout(a));
  // Pages
  await writeFile(projectDir, 'src/app/(dashboard)/dashboard/page.tsx',          dashboardPage(a));
  await writeFile(projectDir, 'src/app/(dashboard)/settings/page.tsx',           settingsPage());
  await writeFile(projectDir, 'src/app/(dashboard)/settings/profile/page.tsx',   profilePage(a));
  await writeFile(projectDir, 'src/app/(dashboard)/settings/security/page.tsx',  securityPage());
  // API routes
  await writeFile(projectDir, 'src/app/api/user/profile/route.ts',               profileApi(a));
  // Components
  await writeFile(projectDir, 'src/components/dashboard/Sidebar.tsx',            sidebar());
  await writeFile(projectDir, 'src/components/dashboard/Header.tsx',             header());
  await writeFile(projectDir, 'src/components/dashboard/StatCard.tsx',           statCard());
  await writeFile(projectDir, 'src/components/dashboard/UserMenu.tsx',           userMenu(a));
  await writeFile(projectDir, 'src/components/dashboard/MobileNav.tsx',          mobileNav());
}

function dashLayout(a: CLIAnswers): string {
  return `import { protectedPage } from '@/lib/session';
import { Sidebar }       from '@/components/dashboard/Sidebar';
import { Header }        from '@/components/dashboard/Header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await protectedPage();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar user={session.user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
`;
}

function dashboardPage(a: CLIAnswers): string {
  const authImport = a.auth === 'supabase'
    ? `import { getCurrentUser } from '@/lib/session';`
    : `import { auth }     from '@/lib/auth';`;

  const sessionFetch = a.auth === 'supabase'
    ? `const user = await getCurrentUser();
  const userName = user?.name?.split(' ')[0] ?? 'there';`
    : `const session = await auth();
  const userName = session?.user?.name?.split(' ')[0] ?? 'there';`;

  return `import type { Metadata } from 'next';
${authImport}
import { db }       from '@/lib/db';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  ${sessionFetch}

  // Fetch real stats
  const [totalUsers, recentUsers] = await Promise.all([
    db.user.count(),
    db.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {userName} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your app today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          trend="+12% from last month"
          positive
        />
        <StatCard
          title="New This Week"
          value={recentUsers.toLocaleString()}
          icon={TrendingUp}
          trend="+3 from last week"
          positive
        />
        <StatCard
          title="Active Sessions"
          value="—"
          icon={Activity}
          trend="Real-time data"
        />
        <StatCard
          title="Uptime"
          value="99.9%"
          icon={Clock}
          trend="Last 30 days"
          positive
        />
      </div>

      {/* Recent activity placeholder */}
      <div className="rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold">Recent Activity</h2>
        <p className="text-sm text-gray-400">
          Activity feed will appear here. Connect your analytics to get started.
        </p>
      </div>
    </div>
  );
}
`;
}

function settingsPage(): string {
  return `import type { Metadata } from 'next';
import Link from 'next/link';
import { User, Shield } from 'lucide-react';

export const metadata: Metadata = { title: 'Settings' };

const sections = [
  { href: '/settings/profile',  label: 'Profile',  desc: 'Update your name, email, and avatar',     icon: User      },
  { href: '/settings/security', label: 'Security', desc: 'Password, 2FA, and active sessions',       icon: Shield    },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account preferences.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 rounded-xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
              <Icon className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
`;
}

function profilePage(a: CLIAnswers): string {
  if (a.auth === 'supabase') {
    return `'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setName(user.user_metadata?.full_name ?? '');
        setEmail(user.email ?? '');
      }
    }
    loadUser();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/user/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name }),
    });

    if (res.ok) {
      toast.success('Profile updated successfully.');
    } else {
      toast.error('Failed to update profile.');
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Update your personal information.</p>
      </div>

      <div className="rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full name</label>
            <input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800/50"
            />
            <p className="text-xs text-gray-400">Email cannot be changed.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
`;
  }

  return `'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name     = formData.get('name') as string;

    const res = await fetch('/api/user/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name }),
    });

    if (res.ok) {
      await update({ name });
      toast.success('Profile updated successfully.');
    } else {
      toast.error('Failed to update profile.');
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Update your personal information.</p>
      </div>

      <div className="rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full name</label>
            <input
              name="name"
              type="text"
              defaultValue={session?.user?.name ?? ''}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              defaultValue={session?.user?.email ?? ''}
              disabled
              className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800/50"
            />
            <p className="text-xs text-gray-400">Email cannot be changed.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
`;
}

function securityPage(): string {
  return `import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Security' };

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your password and account security.</p>
      </div>

      <div className="rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-medium">Change Password</h2>
        <form className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Current password</label>
            <input type="password" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-gray-700 dark:bg-gray-800" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">New password</label>
            <input type="password" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-gray-700 dark:bg-gray-800" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirm new password</label>
            <input type="password" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-gray-700 dark:bg-gray-800" />
          </div>
          <button type="submit" className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
`;
}

function profileApi(a: CLIAnswers): string {
  if (a.auth === 'supabase') {
    return `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db }    from '@/lib/db';
import { z }     from 'zod';

const schema = z.object({
  name: z.string().min(2).max(50),
});

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body   = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 });

  const dbUser = await db.user.update({
    where:  { email: user.email! },
    data:   { name: result.data.name },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user: dbUser });
}
`;
  }

  return `import { NextRequest, NextResponse } from 'next/server';
import { auth }  from '@/lib/auth';
import { db }    from '@/lib/db';
import { z }     from 'zod';

const schema = z.object({
  name: z.string().min(2).max(50),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body   = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 });

  const user = await db.user.update({
    where:  { id: session.user.id },
    data:   { name: result.data.name },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user });
}
`;
}

function sidebar(): string {
  return `'use client';

import Link      from 'next/link';
import Image     from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true  },
  { href: '/settings',  label: 'Settings',  icon: Settings,        exact: false },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-white dark:border-gray-800 dark:bg-gray-950 lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6 dark:border-gray-800">
        <Link href="/" className="text-lg font-bold text-brand">
          Basebolt
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(href, exact)
                ? 'bg-brand/10 text-brand dark:bg-brand/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        {/* Admin link */}
        {user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-brand/10 text-brand'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            <Users className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>

      {/* User info */}
      <div className="border-t p-3 dark:border-gray-800">
        <Link
          href="/settings/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ''} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
              {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name ?? 'User'}</p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>
      </div>
    </aside>
  );
}
`;
}

function header(): string {
  return `import { UserMenu }  from './UserMenu';
import { MobileNav }  from './MobileNav';

interface HeaderProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
      <MobileNav user={user} />
      <div className="flex items-center gap-4 ml-auto">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
`;
}

function statCard(): string {
  return `import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title:    string;
  value:    string;
  icon:     LucideIcon;
  trend?:   string;
  positive?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, positive }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
          <Icon className="h-4 w-4 text-brand" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {trend && (
        <p className={cn('mt-1 flex items-center gap-1 text-xs', positive ? 'text-green-600' : 'text-gray-400')}>
          {positive && <TrendingUp className="h-3 w-3" />}
          {trend}
        </p>
      )}
    </div>
  );
}
`;
}

function userMenu(a: CLIAnswers): string {
  const signOutAction = a.auth === 'supabase'
    ? `async function handleSignOut() {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    }`
    : `async function handleSignOut() {
      const { signOut } = await import('next-auth/react');
      await signOut({ callbackUrl: '/login' });
    }`;

  return `'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Settings, User } from 'lucide-react';

interface UserMenuProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  ${signOutAction}

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-100 dark:hover:bg-gray-800">
        {user.image ? (
          <Image src={user.image} alt="" width={32} height={32} className="rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b p-3 dark:border-gray-700">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <div className="p-1">
              <Link href="/settings/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                <User className="h-4 w-4 text-gray-400" /> Profile
              </Link>
              <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="h-4 w-4 text-gray-400" /> Settings
              </Link>
              <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
`;
}

function mobileNav(): string {
  return `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/settings',  label: 'Settings',  icon: Settings        },
];

interface MobileNavProps {
  user: { role?: string };
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} className="p-2 text-gray-600">
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center justify-between border-b px-6 dark:border-gray-800">
            <span className="text-lg font-bold text-brand">Basebolt</span>
            <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <nav className="p-4 space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={cn('flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium',
                  pathname.startsWith(href) ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
`;
}
