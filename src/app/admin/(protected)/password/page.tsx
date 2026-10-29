import { fontFamily, colors } from '@/lib/theme';
import { PasswordForm } from './PasswordForm';

export default function PasswordPage() {
  return (
    <div>
      <h1 style={{ fontFamily: fontFamily.serif, fontSize: 32, fontWeight: 400, marginBottom: 12 }}>
        Zmiana hasła
      </h1>
      <p style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted, lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
        Zmień hasło do panelu administracyjnego. Hasło musi mieć co najmniej 8 znaków.
      </p>
      <PasswordForm />
    </div>
  );
}
