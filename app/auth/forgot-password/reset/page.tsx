'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';

// Separate component that uses useSearchParams
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const resetToken = searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  // Redirect if no email or token
  useEffect(() => {
    if (!email || !resetToken) {
      router.push('/auth/forgot-password');
    }
  }, [email, resetToken, router]);

  // Calculate password strength
  useEffect(() => {
    const password = formData.newPassword;
    let score = 0;
    
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let label = '';
    let color = '';

    if (score === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 3) {
      label = 'Fair';
      color = 'bg-amber-500';
    } else if (score <= 4) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    setPasswordStrength({ score, label, color });
  }, [formData.newPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message ?? 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
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
          href="/auth/login" 
          className="inline-flex items-center text-[10px] font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Login
        </Link>

        <div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">Reset Password</h1>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            Create a new strong password for your account
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
                  Password reset successful!
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={success}
                placeholder="Enter new password"
                className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-xs font-semibold disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Password Strength</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    passwordStrength.score <= 2 ? 'text-rose-500' :
                    passwordStrength.score <= 3 ? 'text-amber-500' :
                    passwordStrength.score <= 4 ? 'text-indigo-500' :
                    'text-emerald-500'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i < passwordStrength.score
                          ? passwordStrength.color
                          : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-[10px] font-semibold text-slate-400 mt-2">
              Use at least 6 characters with a mix of letters, numbers & symbols
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={success}
                placeholder="Confirm new password"
                className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-xs font-semibold disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <p className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                formData.newPassword === formData.confirmPassword
                  ? 'text-emerald-605'
                  : 'text-rose-505'
              }`}>
                {formData.newPassword === formData.confirmPassword
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-[#0F172A] hover:bg-[#334155] text-white rounded-full font-bold h-11 text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Resetting Password...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Password Reset!
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-slate-50 border border-border/80 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            🔐 Password Security Tips
          </h3>
          <ul className="text-[10px] text-slate-500 font-semibold space-y-1.5">
            <li>• Use a unique password for this account</li>
            <li>• Don't share your password with anyone</li>
            <li>• Change your password regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main page component wrapped with Suspense
export default function ResetPasswordPage() {
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
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}