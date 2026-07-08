'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message ?? 'Failed to send reset code');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirect to verify OTP page after 2 seconds
      setTimeout(() => {
        router.push(`/auth/forgot-password/verify?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-[2rem] border border-border/80 p-8 shadow-sm">
            {/* Back Button */}
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-[10px] font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Login
            </Link>

            <div className="mb-8">
              <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">Forgot Password?</h1>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                No worries! Enter your email address and we'll send you a verification code to reset your password.
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
                      Verification code sent!
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      Check your email for the OTP. Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    disabled={success}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-xs font-semibold disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-2">
                  We'll send a 6-digit verification code to this email
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || success}
                className="w-full bg-[#0F172A] hover:bg-[#334155] text-white rounded-full font-bold h-11 text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Sending Code...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Code Sent!
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-center text-xs text-slate-400 font-semibold">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-accent hover:text-accent/90 font-bold uppercase tracking-wider">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}