'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Save, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type User = {
  name: string;
  email: string;
  phone?: string;
  role: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const { name, value } = e.target;

    setUser({ ...user, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!user?.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!user?.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (user?.phone && !/^\+?[\d\s\-()]+$/.test(user.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;

    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save updated user locally (backend API later)
    localStorage.setItem('user', JSON.stringify(user));

    setIsSaving(false);
    setShowSuccess(true);

    // Redirect after showing success
    setTimeout(() => {
      router.push('/profile');
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading...</p>
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
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-fade-in">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
        <div className="w-full max-w-lg">
          {/* Edit Profile Card */}
          <Card className="relative overflow-hidden border border-border/80 bg-card rounded-3xl shadow-sm">
            {/* Decorative top bar */}
            <div className="h-24 bg-[#0F172A] relative overflow-hidden" />

            {/* Content */}
            <div className="relative px-6 pb-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center -mt-12 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground text-2xl font-bold shadow ring-4 ring-card">
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-card rounded-full flex items-center justify-center shadow border border-border/80 ring-1 ring-accent">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold font-display mt-4 mb-0.5 text-slate-900">
                  Edit Your Profile
                </h1>
                <p className="text-xs font-semibold text-slate-500">Update your personal information</p>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 font-bold text-xs">Success!</p>
                    <p className="text-emerald-700 text-[10px] font-semibold mt-0.5">Your profile has been updated successfully</p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-5 mb-8">
                {/* Name Field */}
                <div className="group">
                  <Label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      value={user.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`h-10 text-xs bg-slate-50 border rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-slate-800 font-semibold transition-all ${errors.name
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-border/80 focus:border-accent'
                        }`}
                    />
                  </div>
                  {errors.name && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="group">
                  <Label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-accent" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={user.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className={`h-10 text-xs bg-slate-50 border rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-slate-800 font-semibold transition-all ${errors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-border/80 focus:border-accent'
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="group">
                  <Label htmlFor="phone" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    Phone Number <span className="text-slate-400 font-normal lowercase ml-1">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={user.phone || ''}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={`h-10 text-xs bg-slate-50 border rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-slate-800 font-semibold transition-all ${errors.phone
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-border/80 focus:border-accent'
                        }`}
                    />
                  </div>
                  {errors.phone && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                  disabled={isSaving}
                  className="flex-1 border border-border/80 hover:bg-slate-50 text-slate-800 rounded-full font-bold h-11 text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-[#0F172A] hover:bg-[#334155] text-white rounded-full font-bold h-11 text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}