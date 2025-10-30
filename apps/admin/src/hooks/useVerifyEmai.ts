import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';

export const useVerifyEmail = () => {
  const { post, loading } = useApi();
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const sendCode = async (email: string) => {
    if (!email) {
      message.error('Please enter your email');
      return;
    }

    try {
      const res = await post('/auth/sendVerification', { email });
      if (res.success) {
        message.success(res.message || 'Verification code sent!');
        setCanResend(false);
        setCountdown(60); 
      }
    } catch (error) {
      // Error already shown in useApi
    }
  };

  const resend = (email: string) => {
    if (canResend) {
      sendCode(email);
    }
  };

  return {
    sendCode,
    resend,
    loading,
    canResend,
    countdown,
  };
};