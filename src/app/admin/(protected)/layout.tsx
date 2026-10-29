import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { AdminShell } from './AdminShell';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return <AdminShell showLocalNotice={!isSupabaseConfigured()}>{children}</AdminShell>;
}
