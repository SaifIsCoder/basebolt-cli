import { writeFile } from '../utils/writeFile.js';

export async function scaffoldAdmin(projectDir: string): Promise<void> {
  await writeFile(projectDir, 'src/app/(admin)/admin/page.tsx',        adminPage());
  await writeFile(projectDir, 'src/app/(admin)/admin/users/page.tsx',  adminUsersPage());
  await writeFile(projectDir, 'src/app/api/admin/users/route.ts',      adminUsersApi());
}

function adminPage(): string {
  return `export default function AdminPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <p className="text-gray-500">Manage users, feature flags, and analytics.</p>
    </main>
  );
}
`;
}

function adminUsersPage(): string {
  return `export default function AdminUsersPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <p className="text-gray-500">View, ban, and manage all users.</p>
    </main>
  );
}
`;
}

function adminUsersApi(): string {
  return `import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(users);
}
`;
}
