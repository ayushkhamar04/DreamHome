'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { User, Mail, Briefcase, Phone, Edit, LogOut, Loader2, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string; phone: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Get initials for avatar
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
        <div className="w-full max-w-xl">
          {/* Profile Card */}
          <Card className="relative overflow-hidden border border-border/80 bg-card rounded-3xl shadow-sm">
            {/* Decorative top bar */}
            <div className="h-24 bg-[#0F172A] relative overflow-hidden" />

            {/* Content */}
            <div className="relative px-6 pb-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 -mt-12 mb-6">
                <div className="relative group mx-auto sm:mx-0">
                  <div className="w-24 h-24 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground text-2xl font-bold shadow ring-4 ring-card">
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-card rounded-full px-2.5 py-0.5 shadow-sm border border-border/80">
                    <span className="text-[9px] font-bold text-accent capitalize tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="text-center sm:text-left mt-3 sm:mt-0 sm:mb-2">
                  <h1 className="text-2xl font-bold font-display text-slate-900 mb-0.5">
                    {user.name}
                  </h1>
                  <p className="text-xs font-bold text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    Verified Member
                  </p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Email */}
                <div className="group p-5 rounded-2xl bg-slate-50 hover:bg-white border border-border/80 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                      <p className="text-xs font-semibold text-slate-800 break-all">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="group p-5 rounded-2xl bg-slate-50 hover:bg-white border border-border/80 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Type</p>
                      <p className="text-xs font-semibold text-slate-800 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                {user.phone && (
                  <div className="group p-5 rounded-2xl bg-slate-50 hover:bg-white border border-border/80 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                        <p className="text-xs font-semibold text-slate-800">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="group p-5 rounded-2xl bg-slate-50 hover:bg-white border border-border/80 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                {(user.role === 'seller' || user.role === 'buyer') && (
                  <Button
                    onClick={() => router.push('/profile/edit')}
                    className="flex-1 bg-[#0F172A] hover:bg-[#334155] text-white rounded-full font-bold h-11 text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Edit Profile
                  </Button>
                )}

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex-1 border border-border/80 hover:bg-slate-50 text-slate-800 rounded-full font-bold h-11 text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          {/* Additional Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-card border border-border/80 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-xl font-bold font-mono text-accent mb-0.5">0</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Properties</div>
            </div>
            <div className="bg-card border border-border/80 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-xl font-bold font-mono text-accent mb-0.5">0</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Inquiries</div>
            </div>
            <div className="bg-card border border-border/80 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-xl font-bold font-mono text-accent mb-0.5">0</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Favorites</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}