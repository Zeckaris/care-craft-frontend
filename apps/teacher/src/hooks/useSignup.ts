/**
 * Teacher useSignup hook.
 *
 * Handles:
 *  1. Sending email verification code via POST /auth/sendVerification
 *  2. Registering with an invite token via POST /auth/signup
 *  3. Updating UserContext and redirecting upon success
 */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/context/UserContext';
import { capitalizeFirstLetter } from '@carecraft/utils';

export interface SignupFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  verificationCode?: string;
  inviteToken: string;
  password: string;
}

export function useSignup() {
  const { post, postMutation } = useApi();
  const { setUser } = useUser();
  const [error, setError] = useState<string | null>(null);

  // Email verification countdown state
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const sendVerificationCode = async (email: string) => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    setVerifying(true);
    try {
      const res = await post({
        url: '/auth/sendVerification',
        body: { email },
        toast: false,
      });

      if (res.success) {
        toast.success(res.message || 'Verification code sent to your email!');
        setCodeSent(true);
        setCanResend(false);
        setCountdown(60);
      } else {
        toast.error(res.message || 'Failed to send verification code');
      }
    } catch (err) {
      const errorMessage = extractApiErrorMessage(err);
      toast.error(
        errorMessage === 'Request Failed'
          ? 'Failed to send verification code'
          : errorMessage,
      );
    } finally {
      setVerifying(false);
    }
  };

  const signup = async (data: SignupFormData) => {
    setError(null);
    try {
      const res = await post({
        url: '/auth/signup',
        body: data,
        toast: false,
      });

      if (res.success) {
        const { _id, firstName, role, email } = res.data.user;

        if (role !== 'teacher') {
          toast.warning(`Account created as ${role}. Please use the admin portal to sign in.`);
          return { success: true, role };
        }

        const formattedName = capitalizeFirstLetter(firstName);
        setUser({
          id: _id,
          firstName: formattedName,
          role,
          email,
        });

        toast.success(res.message || 'Account created successfully! Welcome to CareCraft.');
        return { success: true, role };
      }

      const msg = res.message || 'Signup failed. Please check your invite token and try again.';
      setError(msg);
      return null;
    } catch (err) {
      const errorMessage = extractApiErrorMessage(err);
      const msg =
        errorMessage === 'Request Failed'
          ? 'Signup failed. Please verify your invite token or check connection.'
          : errorMessage;
      setError(msg);
      return null;
    }
  };

  return {
    signup,
    sendVerificationCode,
    loading: postMutation.isPending,
    verifying,
    codeSent,
    canResend,
    countdown,
    error,
    setError,
  };
}
