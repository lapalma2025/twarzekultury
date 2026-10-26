import 'server-only';
import bcrypt from 'bcryptjs';

/**
 * Local admin credentials, used only while Supabase isn't connected yet.
 * Set ADMIN_EMAIL + ADMIN_PASSWORD_HASH in .env.local. Generate a hash with:
 *   node scripts/hash-password.mjs "your-password"
 */
export async function verifyLocalCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) return false;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;
  return bcrypt.compare(password, adminHash);
}
