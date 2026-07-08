import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300 relative overflow-hidden mt-24">
      {/* top hairline */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Newsletter strip */}
        <div className="grid lg:grid-cols-2 gap-8 items-center py-14 border-b border-slate-800">
          <div>
            <h3 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight">
              Find your place to grow.
            </h3>
            <p className="text-slate-400 mt-3 max-w-md text-sm">
              Join our list for handpicked, verified homes and fresh listings — straight to your inbox.
            </p>
          </div>
          <form className="flex w-full max-w-md lg:ml-auto gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 h-11 rounded-full bg-slate-900/60 border border-slate-800 px-5 text-white placeholder:text-slate-500 outline-none focus:border-accent/50 focus:bg-slate-900 transition-colors text-sm"
            />
            <button className="h-11 px-6 rounded-full bg-accent text-accent-foreground font-bold flex items-center gap-2 hover:bg-accent/90 transition-all duration-300 shadow-md shadow-accent/10 text-xs uppercase tracking-wider">
              Subscribe <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 py-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-accent shadow-md shadow-black/10 group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-display text-white group-hover:text-accent transition-colors duration-300">DreamHome</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              A calmer way to find a home. We curate verified, transparent listings so you can settle into the right place with confidence.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 hover:-translate-y-1">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Properties */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6 font-display">Explore</h3>
            <ul className="space-y-4">
              {['Modern Villas', 'City Apartments', 'Garden Homes', 'Waterfront Estates', 'Commercial Spaces'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-accent transition-colors flex items-center gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6 font-display">Company</h3>
            <ul className="space-y-4">
              {['About Us', 'Meet The Team', 'Careers', 'Press & Media', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-accent transition-colors flex items-center gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6 font-display">Get in Touch</h3>
            <ul className="space-y-5">
              {[
                { icon: MapPin, label: 'Office', value: <>125 Green Lane, Suite 400<br />New Delhi, ND 110001</> },
                { icon: Phone, label: 'Phone', value: '+91 (800) 123-4567' },
                { icon: Mail, label: 'Email', value: 'hello@dreamhome.com' },
              ].map(({ icon: Icon, label, value }) => (
                <li key={label}>
                  <a href="#" className="flex items-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 group-hover:border-accent/40 transition-all duration-300">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                      <div className="text-sm text-slate-300 group-hover:text-white transition-colors">{value}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} DreamHome Realty. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
