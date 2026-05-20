'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Home, FileText, Settings, User, ChevronRight, Building2, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

type User = {
  name: string;
  role: string;
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.name && parsed?.role) {
        setUser(parsed);
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-toggle')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="glass-navbar flex h-[72px] items-center justify-between rounded-3xl px-5 sm:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
              <span className="text-2xl font-black font-display tracking-tighter">D</span>
            </div>
            <span className="hidden sm:block text-2xl font-black font-display text-foreground group-hover:text-primary transition-colors">
              DreamHome
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
              <Home className="w-4 h-4 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
              <span className="relative z-10">Browse</span>
            </Link>

            {user?.role === "buyer" && (
              <Link
                href="/requested-properties"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                <FileText className="w-4 h-4 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
                <span className="relative z-10">My Requests</span>
              </Link>
            )}

            {user?.role === "seller" && (
              <>
                <Link
                  href="/submit-property"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  <Building2 className="w-4 h-4 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="relative z-10">Submit Property</span>
                </Link>
                <Link
                  href="/manage-inquiries"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  <MessageSquare className="w-4 h-4 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="relative z-10">Inquiries</span>
                </Link>
                <Link
                  href="/my-properties"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  <LayoutDashboard className="w-4 h-4 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="relative z-10">My Properties</span>
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
              >
                <Settings className="w-4 h-4 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
                <span className="relative z-10">Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-2xl font-semibold h-10 px-5"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground shadow-md hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 rounded-2xl font-bold h-10 px-6 hover:-translate-y-0.5"
                  >
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-muted transition-all duration-300 group"
                  title="View Profile"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-amber-600 text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-sm font-bold text-foreground leading-tight">{user.name}</div>
                    <div className="text-xs text-muted-foreground capitalize font-medium leading-tight">{user.role}</div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden mobile-toggle p-2.5 rounded-2xl hover:bg-muted text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mobile-menu mt-4 glass-panel rounded-3xl animate-in slide-in-from-top-4 duration-300">
            <div className="p-5 space-y-2">

              {/* User Profile Section - Mobile */}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border mb-4 group hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-amber-600 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md group-hover:shadow-lg transition-all">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground capitalize font-medium">{user.role}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              )}

              {/* Navigation Links */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all"
              >
                <Home className="w-5 h-5" />
                <span>Browse Properties</span>
              </Link>

              {user?.role === "buyer" && (
                <Link
                  href="/requested-properties"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all"
                >
                  <FileText className="w-5 h-5" />
                  <span>My Requests</span>
                </Link>
              )}

              {user?.role === "seller" && (
                <>
                  <Link
                    href="/submit-property"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all"
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Submit Property</span>
                  </Link>
                  <Link
                    href="/manage-inquiries"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Manage Inquiries</span>
                  </Link>
                  <Link
                    href="/my-properties"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>My Properties</span>
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Auth Section - Mobile */}
              <div className="pt-4 mt-4 border-t border-border space-y-3">
                {!user ? (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center px-5 py-3.5 rounded-2xl text-foreground hover:bg-muted font-bold transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center px-5 py-3.5 rounded-2xl bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-destructive hover:bg-destructive/10 font-bold transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}