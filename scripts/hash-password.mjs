// Usage: node scripts/hash-password.mjs "your-password"
// Prints a bcrypt hash to paste into .env.local as ADMIN_PASSWORD_HASH.
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
console.log('\nW .env.local zapisz z wyescapowanymi znakami $ (inaczej Next.js spróbuje je rozwinąć jako zmienne):');
console.log(`ADMIN_PASSWORD_HASH=${hash.replaceAll('$', '\\$')}`);
