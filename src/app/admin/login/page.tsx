'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from './actions';
import { colors, fontFamily } from '@/lib/theme';

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        background: colors.accent, color: colors.bg, border: 0, padding: '14px 24px',
        fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase',
        cursor: pending ? 'wait' : 'pointer', fontWeight: 500, opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? 'Logowanie…' : 'Zaloguj się'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ fontFamily: fontFamily.serif, fontStyle: 'italic', fontSize: 30, marginBottom: 8, textAlign: 'center' }}>
          Twarze <span style={{ fontStyle: 'normal', fontWeight: 300 }}>Kultury</span>
        </div>
        <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase', textAlign: 'center', marginBottom: 40 }}>
          Panel administracyjny
        </div>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16, border: `1px solid ${colors.line3}`, padding: 28 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase' }}>E-mail</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              style={{ background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg, padding: '10px 12px', fontSize: 15 }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase' }}>Hasło</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={{ background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg, padding: '10px 12px', fontSize: 15 }}
            />
          </label>

          {state.error && (
            <div role="alert" style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.accent }}>
              {state.error}
            </div>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
