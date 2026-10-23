/**
 * LoginPage - email + password sign-in with optional MFA second step.
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
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { fillDemoAccount } from '@carecraft/auth-hooks';
import { AuthShell } from '@/components/auth/AuthShell';
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
  const handleTryDemo = () => {
    fillDemoAccount('teacher', ({ email, password }) => {
      step1.setValue('email', email, { shouldDirty: true });
      step1.setValue('password', password, { shouldDirty: true });
      step1.clearErrors();
    });
    toast.info("Demo credentials loaded! Click 'Sign In' to continue.");
  };

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
    <AuthShell>
      <h1 className="mb-6 text-center text-2xl font-semibold text-[var(--color-text)]">
        {mfaStep ? 'Check your email' : 'Sign In'}
      </h1>

      {!mfaStep ? (
        /* ── Step 1: Email + Password ─────────────────────────────── */
        <>
          <div className="mb-6 rounded-lg border border-[#b7eb8f] bg-[#f6ffed] p-4 text-center">
            <p className="mb-2 text-sm font-semibold text-[#389e0d]">
              Just exploring? Try the demo!
            </p>
            <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
              See the full dashboard in seconds. No signup required.
            </p>
            <Button
              type="button"
              onClick={handleTryDemo}
              className="h-10 w-full rounded-md bg-[#52c41a] font-semibold text-white hover:bg-[#389e0d]"
            >
              Load Demo Account
            </Button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              {error}
            </div>
          )}

          <form
            id="login-form-step1"
            onSubmit={step1.handleSubmit(onStep1Submit)}
            noValidate
            className="space-y-6"
          >
            {/* Email */}
            <div>
              <Label htmlFor="login-email" className="sr-only">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                error={!!step1.formState.errors.email}
                className="h-10 rounded-md"
                {...step1.register('email')}
              />
              {step1.formState.errors.email && (
                <p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
                  {step1.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="login-password" className="sr-only">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  error={!!step1.formState.errors.password}
                  className="h-10 rounded-md pr-10"
                  {...step1.register('password')}
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {step1.formState.errors.password && (
                <p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
                  {step1.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              id="login-submit"
              type="submit"
              className="mt-2 h-10 w-full rounded-lg"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Have an admin invite token?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[var(--color-primary)] hover:underline"
              >
                Complete Registration
              </Link>
            </p>
          </div>
        </>
      ) : (
        /* ── Step 2: MFA code ─────────────────────────────────────── */
        <>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
              <KeyRound size={18} className="text-[var(--color-primary)]" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              We sent a 6-digit code to{' '}
              <strong>{cachedCredentials?.email}</strong>. It expires in a few minutes.
            </p>
          </div>

          <form
            id="login-form-step2"
            onSubmit={step2.handleSubmit(onStep2Submit)}
            noValidate
            className="space-y-6"
          >
            <div>
              <Label htmlFor="login-mfa-code" className="sr-only">Verification code</Label>
              <Input
                id="login-mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Verification code"
                maxLength={6}
                error={!!step2.formState.errors.mfaCode}
                className={cn('h-10 rounded-md text-center font-mono text-lg tracking-[0.4em]')}
                {...step2.register('mfaCode')}
              />
              {step2.formState.errors.mfaCode && (
                <p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
                  {step2.formState.errors.mfaCode.message}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]"
              >
                {error}
              </div>
            )}

            <Button
              id="mfa-submit"
              type="submit"
              className="mt-2 h-10 w-full rounded-lg"
              disabled={loading}
            >
              {loading ? 'Verifying…' : 'Verify'}
            </Button>

            <Button
              id="mfa-back"
              type="button"
              variant="ghost"
              className="h-10 w-full rounded-lg"
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
    </AuthShell>
  );
}
