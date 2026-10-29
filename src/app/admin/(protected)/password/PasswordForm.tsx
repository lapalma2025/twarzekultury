'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { colors, fontFamily } from '@/lib/theme';
import { changePasswordAction, type PasswordFormState } from './actions';

const initialState: PasswordFormState = {};

const inputStyle: React.CSSProperties = {
  background: colors.bg2,
  border: `1px solid ${colors.line3}`,
  color: colors.fg,
  padding: '10px 12px',
  fontSize: 14,
  width: '100%',
  colorScheme: 'dark',
};

const labelStyle: React.CSSProperties = {
  fontFamily: fontFamily.mono,
  fontSize: 10,
  letterSpacing: '.1em',
  color: colors.muted,
  textTransform: 'uppercase',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        background: colors.accent,
        color: colors.bg,
        border: 0,
        padding: '14px 24px',
        fontFamily: fontFamily.mono,
        fontSize: 12,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        cursor: pending ? 'wait' : 'pointer',
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? 'Zapisywanie…' : 'Zmień hasło'}
    </button>
  );
}

export function PasswordForm() {
  const [state, formAction] = useFormState(changePasswordAction, initialState);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Obecne hasło</span>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Nowe hasło</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Powtórz nowe hasło</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          style={inputStyle}
        />
      </label>

      {state.error && (
        <div role="alert" style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.accent }}>
          {state.error}
        </div>
      )}
      {state.success && (
        <div style={{ fontFamily: fontFamily.mono, fontSize: 12, color: '#7CCB8C' }}>
          Hasło zostało zmienione. Przy następnym logowaniu użyj nowego hasła.
        </div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
