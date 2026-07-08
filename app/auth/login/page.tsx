'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Leaf, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '@/app/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.user.role === 'admin') router.push('/admin/dashboard');
      else router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message ?? 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    'w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent focus:bg-white text-xs font-semibold transition-all duration-300';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-32 sm:py-36">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-[2rem] overflow-hidden border border-border/80 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.15)] bg-card">
          {/* Visual side */}
          <div className="relative hidden lg:block bg-[#0F172A]">
            <img
              src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=1200&fit=crop"
              alt="Serene home"
              className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
              <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <Leaf className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold tracking-wider uppercase">DreamHome</span>
              </div>
              <div className="space-y-4">
                <h2 className="font-display text-4xl font-semibold leading-tight text-white">
                  Welcome back to a<br />calmer way to find home.
                </h2>
                <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-sm">
                  Pick up where you left off — your saved homes, inquiries and requests are waiting.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  Verified listings · secure & private
                </div>
              </div>
            </div>
          </div>

          {/* Form side */}
          <div className="p-8 sm:p-12">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Sign in</h1>
              <p className="text-sm font-semibold text-slate-400">Access your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="text-xs text-rose-700 font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Login as</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 rounded-2xl border border-border/80">
                  {['buyer', 'seller'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, role: r }))}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                        formData.role === r
                          ? 'bg-[#0F172A] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" className={inputBase} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-accent hover:text-slate-800 font-bold uppercase tracking-wider">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className={inputBase} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-bold text-xs uppercase tracking-wider gap-2 shadow shadow-accent/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                {isLoading ? 'Signing in…' : <>Sign in <ArrowRight className="w-3.5 h-3.5" /></>}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/80">
              <p className="text-center text-xs text-slate-400 font-semibold">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-accent hover:text-slate-800 font-bold uppercase tracking-wider ml-1">
                  Create one
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
