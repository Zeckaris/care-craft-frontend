/**
 * SignupPage - Teacher invitation sign-up screen.
 *
 * Allows teachers who received an invite token from school administration
 * to verify their email, set their password, and create their account.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
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
    <AuthShell width="signup">
      <h1 className="mb-2 text-center text-2xl font-semibold text-[var(--color-text)]">
        Teacher Registration
      </h1>
      <p className="mb-6 text-center text-sm text-[var(--color-text-secondary)]">
        Complete your profile using your admin invite token
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Name Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName" className="sr-only">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First Name"
              className="h-10 rounded-md"
              error={Boolean(errors.firstName)}
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName" className="sr-only">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className="h-10 rounded-md"
              error={Boolean(errors.lastName)}
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phoneNumber" className="sr-only">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Phone Number"
            className="h-10 rounded-md"
            error={Boolean(errors.phoneNumber)}
            {...register('phoneNumber')}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Email with Verification button */}
        <div>
          <Label htmlFor="email" className="sr-only">Email Address</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              className="h-10 min-w-0 flex-1 rounded-md"
              error={Boolean(errors.email)}
              {...register('email')}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendCode}
              loading={verifying}
              disabled={!canResend || verifying}
              className="h-10 shrink-0 rounded-md px-3 text-xs"
            >
              {codeSent ? (canResend ? 'Resend' : `${countdown}s`) : 'Verify'}
            </Button>
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p>
          )}
        </div>

        {/* 6-digit Code (shown if sent or optionally entered) */}
        {codeSent && (
          <div className="fade-in">
            <Label htmlFor="verificationCode" className="sr-only">Email Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              maxLength={6}
              placeholder="6-digit Code"
              className="h-10 rounded-md font-mono"
              {...register('verificationCode')}
            />
          </div>
        )}

        {/* Invite Token */}
        <div>
          <Label htmlFor="inviteToken" className="sr-only">Admin Invite Token</Label>
          <Input
            id="inviteToken"
            type="text"
            placeholder="Invite Token"
            className="h-10 rounded-md font-mono text-xs"
            error={Boolean(errors.inviteToken)}
            {...register('inviteToken')}
          />
          {errors.inviteToken && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.inviteToken.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="sr-only">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="h-10 rounded-md pr-10"
              error={Boolean(errors.password)}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className="sr-only">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              className="h-10 rounded-md pr-10"
              error={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="mt-2 h-10 w-full rounded-lg"
          loading={loading}
          disabled={loading}
        >
          Create Account
        </Button>
      </form>

      {/* Switch to sign-in */}
      <div className="mt-4 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Already activated your account?{' '}
          <Link
            to="/signin"
            className="font-semibold text-[var(--color-primary)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
