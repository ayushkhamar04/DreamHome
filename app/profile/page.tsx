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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div className="w-16 h-16 rounded-full border-4 border-[#b04439] border-t-transparent animate-spin absolute top-0"></div>
          </div>
          <p className="text-lg font-medium text-gray-900">Loading your profile...</p>
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-3xl">
          {/* Profile Card */}
          <Card className="relative overflow-hidden shadow-xl border border-gray-200 bg-white">
            {/* Decorative top bar */}
            <div className="h-32 bg-gradient-to-r from-[#b04439] to-[#8d362e] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
            </div>

            {/* Content */}
            <div className="relative px-6 sm:px-8 pb-8">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6 -mt-16 mb-8">
                <div className="relative group mx-auto sm:mx-0">
                  <div className="w-32 h-32 rounded-2xl bg-[#b04439] flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-white transform transition-transform group-hover:scale-105">
                    {initials}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-lg px-3 py-1 shadow-lg border-2 border-gray-200">
                    <span className={`text-xs font-bold ${user.role === 'seller' ? 'text-[#b04439]' :
                        user.role === 'buyer' ? 'text-blue-600' :
                          'text-purple-600'
                      } capitalize`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="text-center sm:text-left mt-4 sm:mt-0 sm:mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {user.name}
                  </h1>
                  <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start gap-2">
                    <Shield className="w-4 h-4 text-[#b04439]" />
                    Verified Member
                  </p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Email */}
                <div className="group p-5 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 hover:border-[#b04439]/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#b04439]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-[#b04439]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                      <p className="text-base font-medium text-gray-900 break-all">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="group p-5 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 hover:border-[#b04439]/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#b04439]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Briefcase className="w-5 h-5 text-[#b04439]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Account Type</p>
                      <p className="text-base font-medium text-gray-900 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                {user.phone && (
                  <div className="group p-5 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 hover:border-[#b04439]/30 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#b04439]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone className="w-5 h-5 text-[#b04439]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                        <p className="text-base font-medium text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="group p-5 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 hover:border-[#b04439]/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#b04439]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5 text-[#b04439]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {(user.role === 'seller' || user.role === 'buyer') && (
                  <Button
                    onClick={() => router.push('/profile/edit')}
                    className="group flex-1 bg-[#b04439] hover:bg-[#8d362e] text-white shadow-md hover:shadow-lg transition-all duration-300 h-12 text-base"
                  >
                    <Edit className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Edit Profile
                  </Button>
                )}

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="group flex-1 border-2 border-gray-300 hover:border-[#b04439] hover:bg-[#b04439]/5 text-gray-700 hover:text-[#b04439] shadow-sm hover:shadow-md transition-all duration-300 h-12 text-base"
                >
                  <LogOut className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          {/* Additional Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-[#b04439] mb-1">0</div>
              <div className="text-xs text-gray-600 font-medium">Properties</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-[#b04439] mb-1">0</div>
              <div className="text-xs text-gray-600 font-medium">Inquiries</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-[#b04439] mb-1">0</div>
              <div className="text-xs text-gray-600 font-medium">Favorites</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}