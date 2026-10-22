/**
 * LoginPage — email + password sign-in with optional MFA second step.
 *
 * Step 1: email + password
 * Step 2 (shown when backend returns mfaRequired): 6-digit email code
 *
 * Uses react-hook-form + zod for validation.
 * Redirects to /app/home on success.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useLogin } from '@/hooks/useLogin';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

/* ── Zod schemas ────────────────────────────────────────────────────────── */
const step1Schema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type Step1Values = z.infer<typeof step1Schema>;

const step2Schema = z.object({
  mfaCode: z
    .string()
    .min(6, 'Enter the 6-digit code')
    .max(6, 'Enter the 6-digit code')
    .regex(/^\d+$/, 'Code must contain only digits'),
});
type Step2Values = z.infer<typeof step2Schema>;

/* ── Component ─────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useUser();
  const { login, loading, error, setError } = useLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  // Cache credentials for MFA step 2
  const [cachedCredentials, setCachedCredentials] = useState<{ email: string; password: string } | null>(null);

  const step1 = useForm<Step1Values>({ resolver: zodResolver(step1Schema) });
  const step2 = useForm<Step2Values>({ resolver: zodResolver(step2Schema) });

  // Already logged in
  if (!userLoading && user?.role === 'teacher') {
    return <Navigate to="/app/home" replace />;
  }

  /* ── Handlers ────────────────────────────────────────────────────────── */
  const onStep1Submit = async (values: Step1Values) => {
    setError(null);
    const result = await login(values.email, values.password);
    if (result?.mfaRequired) {
      setCachedCredentials({ email: values.email, password: values.password });
      setMfaStep(true);
      return;
    }
    if (result) {
      navigate('/app/home', { replace: true });
    }
  };

  const onStep2Submit = async (values: Step2Values) => {
    if (!cachedCredentials) return;
    setError(null);
    const result = await login(
      cachedCredentials.email,
      cachedCredentials.password,
      values.mfaCode,
    );
    if (result && !result.mfaRequired) {
      navigate('/app/home', { replace: true });
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-primary-light)] px-4 py-8 safe-pt safe-pb">
      <div className="w-full max-w-sm fade-in">
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-primary)] shadow-lg mb-4">
            <span className="text-2xl font-black text-[var(--color-primary-fg)] tracking-tight">CC</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">CareCraft</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Teacher Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
          {!mfaStep ? (
            /* ── Step 1: Email + Password ─────────────────────────────── */
            <>
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">Sign in</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Enter your school email and password.
              </p>

              <form
                id="login-form-step1"
                onSubmit={step1.handleSubmit(onStep1Submit)}
                noValidate
                className="space-y-4"
              >
                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="login-email" required>Email</Label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                    />
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@school.edu"
                      error={!!step1.formState.errors.email}
                      className="pl-9"
                      {...step1.register('email')}
                    />
                  </div>
                  {step1.formState.errors.email && (
                    <p className="text-xs text-[var(--color-danger)]" role="alert">
                      {step1.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="login-password" required>Password</Label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                    />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      error={!!step1.formState.errors.password}
                      className="pl-9 pr-11"
                      {...step1.register('password')}
                    />
                    <button
                      type="button"
                      id="toggle-password"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {step1.formState.errors.password && (
                    <p className="text-xs text-[var(--color-danger)]" role="alert">
                      {step1.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-[var(--radius-md)] bg-[var(--color-danger-light)] px-3 py-2.5 text-sm text-[var(--color-danger)]"
                  >
                    {error}
                  </div>
                )}

                <Button
                  id="login-submit"
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>

                <div className="pt-2 text-center border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Have an admin invite token?{' '}
                    <Link
                      to="/signup"
                      className="font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      Complete Registration
                    </Link>
                  </p>
                </div>
              </form>
            </>
          ) : (
            /* ── Step 2: MFA code ─────────────────────────────────────── */
            <>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                  <KeyRound size={18} className="text-[var(--color-primary)]" />
                </div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Check your email</h2>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                We sent a 6-digit code to{' '}
                <strong>{cachedCredentials?.email}</strong>. It expires in a few minutes.
              </p>

              <form
                id="login-form-step2"
                onSubmit={step2.handleSubmit(onStep2Submit)}
                noValidate
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="login-mfa-code" required>Verification code</Label>
                  <Input
                    id="login-mfa-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    error={!!step2.formState.errors.mfaCode}
                    className={cn('text-center tracking-[0.4em] text-lg font-mono')}
                    {...step2.register('mfaCode')}
                  />
                  {step2.formState.errors.mfaCode && (
                    <p className="text-xs text-[var(--color-danger)]" role="alert">
                      {step2.formState.errors.mfaCode.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-[var(--radius-md)] bg-[var(--color-danger-light)] px-3 py-2.5 text-sm text-[var(--color-danger)]"
                  >
                    {error}
                  </div>
                )}

                <Button
                  id="mfa-submit"
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Verifying…' : 'Verify'}
                </Button>

                <Button
                  id="mfa-back"
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setMfaStep(false);
                    setError(null);
                    step2.reset();
                  }}
                >
                  ← Back to sign in
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
