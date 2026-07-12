'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Home, FileText, Settings, ChevronRight, Building2, MessageSquare, LayoutDashboard, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/api';
import { toast } from '@/hooks/use-toast';

type User = { name: string; role: string };

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.name && parsed?.role) setUser(parsed);
      else localStorage.removeItem('user');
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
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
      if (isOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-toggle')) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!token || !storedUser) return;

    let currentUser: any = null;
    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      return;
    }
    if (!currentUser) return;

    const seenMessageIds = new Set<string>();
    let isFirstLoad = true;

    const playChime = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const playTone = (freq: number, startTime: number, duration: number, volume: number) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.03);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        // Premium 3-tone arpeggiated C-major chord arpeggio with a warm C4 sub-bass
        playTone(261.63, now, 0.6, 0.03); // C4
        playTone(523.25, now, 0.5, 0.05); // C5
        playTone(659.25, now + 0.08, 0.55, 0.05); // E5
        playTone(783.99, now + 0.16, 0.6, 0.05); // G5
      } catch (err) {
        console.error('Audio play error:', err);
      }
    };

    const checkMessages = async () => {
      try {
        const res = await api.get('/messages/unread/check', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && Array.isArray(res.data.activeChats)) {
          let hasNewIncoming = false;

          res.data.activeChats.forEach((msg: any) => {
            const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
            const myUserId = currentUser?.id || currentUser?._id;

            if (senderId && myUserId && senderId.toString() !== myUserId.toString()) {
              if (!seenMessageIds.has(msg._id)) {
                seenMessageIds.add(msg._id);
                if (!isFirstLoad) {
                  hasNewIncoming = true;
                  const senderName = msg.sender?.name || 'Property Owner';
                  toast({
                    title: undefined,
                    description: (
                      <div className="flex items-start gap-3 py-1 text-slate-800">
                        <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs shadow-sm shadow-accent/25 flex-shrink-0">
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none">New Message</div>
                          <div className="text-xs font-bold text-slate-900 capitalize mt-1.5">{senderName}</div>
                          <div className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">{msg.message}</div>
                        </div>
                      </div>
                    ),
                  });
                }
              }
            }
          });

          if (hasNewIncoming) {
            playChime();
          }
          isFirstLoad = false;
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    };

    checkMessages();
    const interval = setInterval(checkMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  const navLink =
    'group relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-foreground transition-all duration-300';
  const underline =
    'pointer-events-none absolute inset-x-3 -bottom-px h-0.5 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-x-100';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`glass-navbar flex items-center justify-between rounded-full pl-3 pr-3 sm:pl-5 transition-all duration-500 ${scrolled ? 'h-14 bg-background/85 border border-border/80 shadow-md' : 'h-16 bg-background/30 border border-transparent shadow-none'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center text-[#FAFAF8] shadow-sm shadow-black/10 group-hover:scale-105 transition-transform duration-300">
              <Leaf className="w-4 h-4 text-accent" />
            </div>
            <span className="text-lg font-bold font-display text-foreground tracking-tight group-hover:text-accent transition-colors duration-300">DreamHome</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className={navLink}>
              <Home className="w-3.5 h-3.5" /> Browse <span className={underline} />
            </Link>
            {user?.role === 'buyer' && (
              <Link href="/requested-properties" className={navLink}>
                <FileText className="w-3.5 h-3.5" /> My Requests <span className={underline} />
              </Link>
            )}
            {user?.role === 'seller' && (
              <>
                <Link href="/submit-property" className={navLink}>
                  <Building2 className="w-3.5 h-3.5" /> Submit <span className={underline} />
                </Link>
                <Link href="/manage-inquiries" className={navLink}>
                  <MessageSquare className="w-3.5 h-3.5" /> Inquiries <span className={underline} />
                </Link>
                <Link href="/my-properties" className={navLink}>
                  <LayoutDashboard className="w-3.5 h-3.5" /> My Properties <span className={underline} />
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className={navLink}>
                <Settings className="w-3.5 h-3.5" /> Admin <span className={underline} />
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-foreground/75 hover:text-foreground hover:bg-accent/10 rounded-full font-bold h-9 px-4 text-xs uppercase tracking-wider transition-colors duration-300">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm shadow-accent/20 hover:shadow-md transition-all duration-300 rounded-full font-bold h-9 px-5 text-xs uppercase tracking-wider hover:-translate-y-0.5">
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-accent/10 border border-transparent hover:border-accent/15 transition-all duration-300 group" title="View Profile">
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs shadow-sm shadow-accent/25 group-hover:scale-105 transition-transform duration-300">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden xl:block text-left pr-1">
                    <div className="text-xs font-bold text-foreground leading-none">{user.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize font-bold leading-none mt-1">{user.role}</div>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="w-9 h-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden mobile-toggle p-2 rounded-full hover:bg-accent/10 text-foreground transition-colors" aria-label="Toggle menu">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mobile-menu mt-2.5 glass-panel rounded-3xl animate-in slide-in-from-top-2 duration-300">
            <div className="p-4 space-y-1.5">
              {user && (
                <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl bg-accent/60 border border-border mb-3 group hover:border-primary/30 transition-all">
                  <div className="w-10 h-10 rounded-2xl brand-gradient text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground capitalize font-medium">{user.role}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              )}

              {[
                { href: '/', icon: Home, label: 'Browse Properties', show: true },
                { href: '/requested-properties', icon: FileText, label: 'My Requests', show: user?.role === 'buyer' },
                { href: '/submit-property', icon: Building2, label: 'Submit Property', show: user?.role === 'seller' },
                { href: '/manage-inquiries', icon: MessageSquare, label: 'Manage Inquiries', show: user?.role === 'seller' },
                { href: '/my-properties', icon: LayoutDashboard, label: 'My Properties', show: user?.role === 'seller' },
                { href: '/admin', icon: Settings, label: 'Admin Panel', show: user?.role === 'admin' },
              ]
                .filter((l) => l.show)
                .map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-foreground/80 hover:bg-accent hover:text-primary font-semibold text-sm transition-all">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                ))}

              <div className="pt-3 mt-3 border-t border-border space-y-2">
                {!user ? (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-full text-foreground hover:bg-accent font-bold text-sm transition-all">
                      Login
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-sm shadow-primary/25 transition-all">
                      Sign up
                    </Link>
                  </>
                ) : (
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-destructive hover:bg-destructive/10 font-bold text-sm transition-all">
                    <LogOut className="w-4 h-4" />
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
