import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

const allowedEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
  : [];

export default async function AdminPage() {
  const session = await getServerSession();
  const email = session?.user?.email?.toLowerCase();

  if (!email || !allowedEmails.includes(email)) {
    // Redirect to NextAuth default sign-in page, Callback returns them to /admin
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  return <AdminDashboard user={session.user} />;
}
