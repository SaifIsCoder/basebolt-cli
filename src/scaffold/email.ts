import { writeFile } from '../utils/writeFile.js';

export async function scaffoldEmail(projectDir: string): Promise<void> {
  await writeFile(projectDir, 'src/lib/email.ts',                      emailLib());
  await writeFile(projectDir, 'src/emails/WelcomeEmail.tsx',           welcomeEmail());
  await writeFile(projectDir, 'src/emails/PasswordResetEmail.tsx',     passwordResetEmail());
  await writeFile(projectDir, 'src/emails/InvoiceEmail.tsx',           invoiceEmail());
  await writeFile(projectDir, 'src/emails/TrialEndingEmail.tsx',       trialEndingEmail());
  await writeFile(projectDir, 'src/emails/ReceiptEmail.tsx',           receiptEmail());
}

function emailLib(): string {
  return `import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to, subject, react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'noreply@basebolt.dev',
    to,
    subject,
    react,
  });
}
`;
}

function welcomeEmail(): string {
  return `import { Html, Body, Heading, Text, Button } from '@react-email/components';

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Body>
        <Heading>Welcome, {name}!</Heading>
        <Text>Thanks for signing up. Your account is ready.</Text>
        <Button href={process.env.NEXTAUTH_URL!}>Get started</Button>
      </Body>
    </Html>
  );
}
`;
}

function passwordResetEmail(): string {
  return `import { Html, Body, Heading, Text, Button } from '@react-email/components';

export function PasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <Html>
      <Body>
        <Heading>Reset your password</Heading>
        <Text>Click below to reset your password. Link expires in 1 hour.</Text>
        <Button href={resetUrl}>Reset password</Button>
      </Body>
    </Html>
  );
}
`;
}

function invoiceEmail(): string {
  return `import { Html, Body, Heading, Text } from '@react-email/components';

export function InvoiceEmail({ amount, invoiceId }: { amount: number; invoiceId: string }) {
  return (
    <Html>
      <Body>
        <Heading>Your invoice</Heading>
        <Text>Invoice #{invoiceId}</Text>
        <Text>Amount: \${(amount / 100).toFixed(2)}</Text>
      </Body>
    </Html>
  );
}
`;
}

function trialEndingEmail(): string {
  return `import { Html, Body, Heading, Text, Button } from '@react-email/components';

export function TrialEndingEmail({ daysLeft }: { daysLeft: number }) {
  return (
    <Html>
      <Body>
        <Heading>Your trial ends in {daysLeft} days</Heading>
        <Text>Upgrade now to keep access to all features.</Text>
        <Button href={process.env.NEXTAUTH_URL + '/billing'}>Upgrade now</Button>
      </Body>
    </Html>
  );
}
`;
}

function receiptEmail(): string {
  return `import { Html, Body, Heading, Text } from '@react-email/components';

export function ReceiptEmail({ amount, plan }: { amount: number; plan: string }) {
  return (
    <Html>
      <Body>
        <Heading>Receipt — {plan}</Heading>
        <Text>Thank you for your purchase.</Text>
        <Text>Amount paid: \${(amount / 100).toFixed(2)}</Text>
      </Body>
    </Html>
  );
}
`;
}
