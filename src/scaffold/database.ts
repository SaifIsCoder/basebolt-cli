import type { CLIAnswers } from '../cli.js';
import { writeFile } from '../utils/writeFile.js';

export async function scaffoldDatabase(projectDir: string, a: CLIAnswers): Promise<void> {
  await writeFile(projectDir, 'src/lib/db.ts',            dbClient());
  await writeFile(projectDir, 'prisma/schema.prisma',      prismaSchema(a));
  await writeFile(projectDir, 'prisma/seed.ts',            prismaSeed(a));
  if (a.auth === 'nextauth') {
    await writeFile(projectDir, 'src/app/api/auth/register/route.ts', registerApi());
  }
}

function dbClient(): string {
  return `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
`;
}

function prismaSchema(a: CLIAnswers): string {

  // NextAuth-specific models
  const nextauthModels = a.auth === 'nextauth' ? `
// ── NextAuth Models ───────────────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
` : '';

  const nextAuthRelations = a.auth === 'nextauth'
    ? `
  accounts      Account[]
  sessions      Session[]
`
    : '';

  const passwordField = a.auth === 'nextauth'
    ? '  password      String?   // null for OAuth users'
    : '';

  // Waitlist model
  const waitlistModel = a.waitlist ? `
// ── Waitlist ──────────────────────────────────────────────────────────

model Waitlist {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())

  @@map("waitlist")
}
` : '';

  return `// Basebolt — Prisma Schema
// Database: ${a.database}
// Docs: https://www.prisma.io/docs

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
${a.database === 'supabase' ? '  directUrl = env("DIRECT_URL")' : ''}
}

// ── Users & Auth ──────────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
${passwordField}
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
${nextAuthRelations}
  @@index([email])
  @@map("users")
}
${nextauthModels}
// ── Enums ─────────────────────────────────────────────────────────────

enum Role {
  USER
  ADMIN
}
${waitlistModel}`;
}



function prismaSeed(a: CLIAnswers): string {
  if (a.auth === 'supabase') {
    // For Supabase Auth, seed users without password hashing
    return `import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Note: With Supabase Auth, users are created via Supabase Dashboard or signUp().
  // This seed creates matching User records in your database for testing.

  const admin = await db.user.upsert({
    where:  { email: 'admin@example.com' },
    update: {},
    create: {
      name:          'Admin User',
      email:         'admin@example.com',
      role:          'ADMIN',
      emailVerified: new Date(),
    },
  });

  const user = await db.user.upsert({
    where:  { email: 'user@example.com' },
    update: {},
    create: {
      name:          'Test User',
      email:         'user@example.com',
      role:          'USER',
      emailVerified: new Date(),
    },
  });

  console.log('✔ Created admin:', admin.email);
  console.log('✔ Created user:', user.email);
  console.log('✅ Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
`;
  }

  return `import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await hash('admin123!', 12);
  const admin = await db.user.upsert({
    where:  { email: 'admin@example.com' },
    update: {},
    create: {
      name:          'Admin User',
      email:         'admin@example.com',
      password:      adminPassword,
      role:          'ADMIN',
      emailVerified: new Date(),
    },
  });

  // Regular test user
  const userPassword = await hash('user123!', 12);
  const user = await db.user.upsert({
    where:  { email: 'user@example.com' },
    update: {},
    create: {
      name:          'Test User',
      email:         'user@example.com',
      password:      userPassword,
      role:          'USER',
      emailVerified: new Date(),
    },
  });

  console.log('✔ Created admin:', admin.email);
  console.log('✔ Created user:', user.email);
  console.log('✅ Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
`;
}

function registerApi(): string {
  return `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (cost factor 12)
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });

  } catch (error) {
    console.error('[REGISTER]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;
}
