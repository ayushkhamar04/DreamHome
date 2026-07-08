'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

// Separate component that uses useSearchParams
function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/auth/forgot-password');
    }
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data?.message ?? 'Failed to resend OTP');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          otp: otpString 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message ?? 'Invalid verification code');
        setIsLoading(false);
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess(true);
      
      // Redirect to reset password page with reset token
      setTimeout(() => {
        router.push(`/auth/forgot-password/reset?email=${encodeURIComponent(email)}&token=${data.resetToken}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-card rounded-[2rem] border border-border/80 p-8 shadow-sm">
        {/* Back Button */}
        <Link 
          href="/auth/forgot-password" 
          className="inline-flex items-center text-[10px] font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back
        </Link>

        <div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center mb-4 text-xl">
            🔐
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">Verify Code</h1>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            We've sent a 6-digit verification code to{' '}
            <span className="font-bold text-slate-800">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
            <p className="text-xs font-bold text-rose-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Code verified successfully!
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Redirecting to reset password...
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Enter Verification Code
            </label>
            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={success}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border border-border/80 rounded-xl text-slate-850 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              ))}
            </div>
            <p className="text-[10px] font-semibold text-slate-405 mt-2">
              Code expires in 10 minutes
            </p>
          </div>

          {/* Timer and Resend */}
          <div className="flex items-center justify-between text-xs">
            {!canResend ? (
              <p className="text-slate-400 font-semibold">
                Resend code in <span className="font-bold text-slate-800">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-accent hover:text-accent/90 font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resend Code
                  </>
                )}
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || success || otp.join('').length !== 6}
            className="w-full bg-[#0F172A] hover:bg-[#334155] text-white rounded-full font-bold h-11 text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Verifying...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Verified!
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-center text-xs text-slate-450 font-semibold">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="text-accent hover:text-accent/90 font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main page component wrapped with Suspense
export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
        <Suspense fallback={
          <div className="w-full max-w-md">
            <div className="bg-card rounded-[2rem] border border-border/80 p-8">
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            </div>
          </div>
        }>
          <VerifyOTPForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}