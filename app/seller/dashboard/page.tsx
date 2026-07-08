'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function SellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'seller') {
        // Not a seller? Redirect to home
        router.push('/');
        return;
      }
      setUser(parsedUser);
    } else {
      // Not logged in? Redirect to login
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-12">
        <div className="w-full max-w-2xl bg-card p-8 rounded-lg border border-border text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Hello, {user.name}!
          </h1>
          <p className="text-muted-foreground mb-6">
            Welcome to your Seller Dashboard. Here you can manage your listings and view your sales.
          </p>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
