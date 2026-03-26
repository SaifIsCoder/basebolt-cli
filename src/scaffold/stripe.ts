import { writeFile } from '../utils/writeFile.js';

export async function scaffoldStripe(projectDir: string): Promise<void> {
  await writeFile(projectDir, 'src/lib/stripe.ts',                       stripeLib());
  await writeFile(projectDir, 'src/app/api/stripe/webhook/route.ts',     webhook());
  await writeFile(projectDir, 'src/app/api/stripe/checkout/route.ts',    checkout());
  await writeFile(projectDir, 'src/app/(dashboard)/billing/page.tsx',    billingPage());
}

function stripeLib(): string {
  return `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const PLANS = {
  solo:   { priceId: 'price_solo_id',   name: 'Solo',   amount: 4900 },
  agency: { priceId: 'price_agency_id', name: 'Agency', amount: 9900 },
} as const;
`;
}

function webhook(): string {
  return `import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // TODO: provision access
      break;
    case 'customer.subscription.deleted':
      // TODO: revoke access
      break;
    case 'invoice.payment_failed':
      // TODO: send failed payment email
      break;
  }

  return NextResponse.json({ received: true });
}
`;
}

function checkout(): string {
  return `import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const { plan } = await req.json() as { plan: keyof typeof PLANS };

  const session = await stripe.checkout.sessions.create({
    mode: plan === 'solo' ? 'payment' : 'subscription',
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: \`\${process.env.NEXTAUTH_URL}/dashboard?success=1\`,
    cancel_url:  \`\${process.env.NEXTAUTH_URL}/billing\`,
  });

  return NextResponse.json({ url: session.url });
}
`;
}

function billingPage(): string {
  return `import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header }  from '@/components/dashboard/Header';

export default function BillingPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Billing" />
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-semibold mb-4">Billing & Subscription</h2>
          <p className="text-gray-500">Manage your plan and payment details.</p>
        </main>
      </div>
    </div>
  );
}
`;
}
