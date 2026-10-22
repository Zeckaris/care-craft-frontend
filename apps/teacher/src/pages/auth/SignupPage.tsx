/**
 * SignupPage — Teacher invitation sign-up screen.
 *
 * Allows teachers who received an invite token from school administration
 * to verify their email, set their password, and create their account.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useSignup, type SignupFormData } from '@/hooks/useSignup';

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phoneNumber: z.string().min(5, 'Valid phone number is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    verificationCode: z.string().optional(),
    inviteToken: z.string().min(1, 'Invite token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const {
    signup,
    sendVerificationCode,
    loading,
    verifying,
    codeSent,
    canResend,
    countdown,
    error,
  } = useSignup();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const handleSendCode = () => {
    const email = getValues('email');
    sendVerificationCode(email);
  };

  const onSubmit = async (values: SignupFormValues) => {
    const payload: SignupFormData = {
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      verificationCode: values.verificationCode,
      inviteToken: values.inviteToken,
      password: values.password,
    };

    const res = await signup(payload);
    if (res?.success) {
      if (res.role === 'teacher') {
        navigate('/app/home', { replace: true });
      } else {
        navigate('/signin', { replace: true });
      }
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-primary-light)] px-4 py-8 safe-pt safe-pb">
      <div className="w-full max-w-md fade-in">
        {/* Brand header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-primary)] shadow-lg mb-3">
            <span className="text-xl font-black text-[var(--color-primary-fg)] tracking-tight">CC</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">Teacher Registration</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Complete your profile using your admin invite token
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-[var(--color-danger)] p-3 text-xs text-[var(--color-danger)] font-medium"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" required>First Name</Label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    className="pl-9"
                    error={Boolean(errors.firstName)}
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-[var(--color-danger)]">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="lastName" required>Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  error={Boolean(errors.lastName)}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-[var(--color-danger)]">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phoneNumber" required>Phone Number</Label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-9"
                  error={Boolean(errors.phoneNumber)}
                  {...register('phoneNumber')}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-[var(--color-danger)]">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Email with Verification button */}
            <div className="space-y-1">
              <Label htmlFor="email" required>Email Address</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@school.org"
                    className="pl-9"
                    error={Boolean(errors.email)}
                    {...register('email')}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handleSendCode}
                  loading={verifying}
                  disabled={!canResend || verifying}
                  className="shrink-0 text-xs px-3 min-w-[76px]"
                >
                  {codeSent ? (canResend ? 'Resend' : `${countdown}s`) : 'Verify'}
                </Button>
              </div>
              {errors.email && (
                <p className="text-xs text-[var(--color-danger)]">{errors.email.message}</p>
              )}
            </div>

            {/* 6-digit Code (shown if sent or optionally entered) */}
            {codeSent && (
              <div className="space-y-1 fade-in">
                <Label htmlFor="verificationCode" required>Email Verification Code</Label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    id="verificationCode"
                    type="text"
                    maxLength={6}
                    placeholder="6-digit code from email"
                    className="pl-9 font-mono"
                    {...register('verificationCode')}
                  />
                </div>
              </div>
            )}

            {/* Invite Token */}
            <div className="space-y-1">
              <Label htmlFor="inviteToken" required>Admin Invite Token</Label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <Input
                  id="inviteToken"
                  type="text"
                  placeholder="Paste invite token from administrator"
                  className="pl-9 font-mono text-xs"
                  error={Boolean(errors.inviteToken)}
                  {...register('inviteToken')}
                />
              </div>
              {errors.inviteToken && (
                <p className="text-xs text-[var(--color-danger)]">{errors.inviteToken.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" required>Password</Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  className="pl-9 pr-10"
                  error={Boolean(errors.password)}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[var(--color-danger)]">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" required>Confirm Password</Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  className="pl-9 pr-10"
                  error={Boolean(errors.confirmPassword)}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-[var(--color-danger)]">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </form>

          {/* Switch to sign-in */}
          <div className="mt-5 border-t border-[var(--color-border)] pt-4 text-center">
            <p className="text-xs text-[var(--color-text-secondary)]">
              Already activated your account?{' '}
              <Link
                to="/signin"
                className="font-semibold text-[var(--color-primary)] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link
            to="/signin"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <ArrowLeft size={13} />
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
