import type { CLIAnswers } from '../cli.js';
import { writeFile } from '../utils/writeFile.js';

export async function scaffoldWaitlist(projectDir: string, a: CLIAnswers): Promise<void> {
  await writeFile(projectDir, 'src/app/api/waitlist/route.ts',        waitlistApi());
  await writeFile(projectDir, 'src/components/WaitlistForm.tsx',      waitlistForm());
}

function waitlistApi(): string {
  return `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
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

    const email = result.data.email.toLowerCase().trim();

    // Check for duplicate
    const existing = await db.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You're already on the waitlist!" },
        { status: 200 }
      );
    }

    await db.waitlist.create({
      data: { email },
    });

    return NextResponse.json(
      { message: "You're on the list! We'll be in touch." },
      { status: 201 }
    );
  } catch (error) {
    console.error('[WAITLIST]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
`;
}

function waitlistForm(): string {
  return `'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export function WaitlistForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success(json.message ?? "You're on the list!");
        reset();
      } else {
        toast.error(json.error ?? 'Something went wrong');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full max-w-md gap-2">
      <div className="flex-1">
        <input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="shrink-0 rounded-xl bg-brand px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Joining...' : 'Join Waitlist'}
      </button>
    </form>
  );
}
`;
}
