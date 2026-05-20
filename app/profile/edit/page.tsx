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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div className="w-16 h-16 rounded-full border-4 border-[#b04439] border-t-transparent animate-spin absolute top-0"></div>
          </div>
          <p className="text-lg font-medium text-gray-900">Loading...</p>
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-rose-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-2xl">
          {/* Edit Profile Card */}
          <Card className="relative overflow-hidden shadow-2xl border border-gray-200 bg-white rounded-3xl">
            {/* Decorative top bar */}
            <div className="h-32 bg-gradient-to-r from-[#b04439] to-[#8d362e] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
            </div>

            {/* Content */}
            <div className="relative px-6 sm:px-8 pb-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center -mt-16 mb-8">
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#b04439] to-[#8d362e] flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white">
                    {initials}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg ring-2 ring-[#b04439]">
                    <User className="w-5 h-5 text-[#b04439]" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold mt-6 mb-1 text-gray-900">
                  Edit Your Profile
                </h1>
                <p className="text-gray-500 text-sm">Update your personal information</p>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 font-semibold text-sm">Success!</p>
                    <p className="text-emerald-700 text-xs">Your profile has been updated successfully</p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-5 mb-8">
                {/* Name Field */}
                <div className="group">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#b04439]" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      value={user.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`h-12 text-base border-2 rounded-xl transition-all ${errors.name
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:border-[#b04439] focus:ring-[#b04439]'
                        }`}
                    />
                  </div>
                  {errors.name && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="group">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#b04439]" />
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
                      className={`h-12 text-base border-2 rounded-xl transition-all ${errors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:border-[#b04439] focus:ring-[#b04439]'
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="group">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#b04439]" />
                    Phone Number <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={user.phone || ''}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={`h-12 text-base border-2 rounded-xl transition-all ${errors.phone
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:border-[#b04439] focus:ring-[#b04439]'
                        }`}
                    />
                  </div>
                  {errors.phone && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                  disabled={isSaving}
                  className="group flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md transition-all duration-300 h-12 text-base rounded-xl"
                >
                  <X className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="group flex-1 bg-gradient-to-r from-[#b04439] to-[#8d362e] hover:from-[#8d362e] hover:to-[#6b2a23] text-white shadow-md hover:shadow-lg transition-all duration-300 h-12 text-base disabled:opacity-70 disabled:cursor-not-allowed rounded-xl"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
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