'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import PropertyFilters from '@/components/PropertyFilters';
import Footer from '@/components/Footer';
import InquiryModal from './components/InquiryModel';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Users, TrendingUp, MapPin, Loader2,
  Calendar, Home, Bed, DollarSign, FileCheck, Download,
  AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight,
  Maximize2, Shield, Phone, Mail, User, Award, Star,
  BadgeCheck, HeartHandshake, Search, Sparkles, Building2,
  KeyRound, TrendingDown, Building, SlidersHorizontal, Navigation, X,
  Map, List, ArrowUpRight, Zap, Eye
} from 'lucide-react';
import Link from 'next/link';
import api from './lib/api';

const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({ property, isBuyer, onInquiry }: {
  property: any; isBuyer: boolean;
  onInquiry: (propertyId: string, propertyTitle: string) => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  if (!property) return null;

  const images = property.propertyImages || [];

  const formatPrice = (price: any) => {
    if (!price || isNaN(Number(price))) return '₹0';
    const n = Number(price);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  };

  const formatDate = (d: string) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return 'N/A'; }
  };

  const getFacilities = () => {
    if (!property.facilities) return [];
    try {
      if (typeof property.facilities === 'string') {
        const p = JSON.parse(property.facilities);
        if (Array.isArray(p) && p.length > 0 && typeof p[0] === 'string' && p[0].startsWith('[')) return JSON.parse(p[0]);
        return Array.isArray(p) ? p : [];
      }
      if (Array.isArray(property.facilities)) {
        if (property.facilities.length > 0 && typeof property.facilities[0] === 'string' && property.facilities[0].startsWith('[')) return JSON.parse(property.facilities[0]);
        return property.facilities;
      }
    } catch { return []; }
    return [];
  };

  const statusMap: Record<string, { label: string; cls: string }> = {
    approved: { label: 'Verified', cls: 'bg-emerald-500 text-white' },
    pending: { label: 'Pending', cls: 'bg-amber-500 text-white' },
    rejected: { label: 'Rejected', cls: 'bg-rose-500 text-white' },
  };
  const statusInfo = statusMap[property.status] || { label: property.status, cls: 'bg-gray-500 text-white' };
  const facilities = getFacilities();
  const propertyTitle = `${property.bhk || 'N/A'} ${property.propertyType || 'Property'}`;

  return (
    <div
      className="group relative flex flex-col bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover-lift"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-[240px] overflow-hidden bg-muted flex-shrink-0">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={propertyTitle}
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {images.length > 1 && isHovered && (
              <>
                <button onClick={(e) => { e.preventDefault(); setCurrentImageIndex(p => (p - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center shadow-lg transition-all">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={(e) => { e.preventDefault(); setCurrentImageIndex(p => (p + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center shadow-lg transition-all">
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold text-white tracking-wide uppercase border border-white/20 shadow-sm">
                {property.propertyType}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${statusInfo.cls}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="text-3xl font-display font-black text-white tracking-tight leading-none drop-shadow-md">{formatPrice(property.price)}</div>
              <div className="text-[10px] text-white/80 uppercase tracking-[0.2em] font-bold mt-1.5">
                For {property.propertyFor || 'N/A'}
              </div>
            </div>

            {/* Image dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1.5">
                {images.slice(0, 5).map((_: any, i: number) => (
                  <button key={i} onClick={(e) => { e.preventDefault(); setCurrentImageIndex(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-primary w-5' : 'bg-white/50 w-1.5 hover:bg-white/80'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Home className="w-12 h-12 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-5 bg-card">
        <div>
          <h3 className="text-xl font-display font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {property.bhk} {property.propertyType}
          </h3>
          {property.propertyName && (
            <p className="text-sm font-medium text-muted-foreground mt-1 line-clamp-1">{property.propertyName}</p>
          )}
          <div className="flex items-center gap-2 mt-2.5 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium">{property.city || 'Unknown'}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm text-foreground py-4 border-y border-border">
          <div className="flex flex-col items-center gap-1">
            <Bed className="w-4 h-4 text-primary/70" />
            <span className="font-bold">{property.bhk || '—'}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center gap-1">
            <Maximize2 className="w-4 h-4 text-primary/70" />
            <span className="font-bold">{property.sqft || '—'} <span className="text-xs text-muted-foreground font-normal">sqft</span></span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center gap-1">
            <Calendar className="w-4 h-4 text-primary/70" />
            <span className="text-xs font-semibold">{formatDate(property.createdAt)}</span>
          </div>
        </div>

        {/* Mini map */}
        {property.location?.lat && property.location?.lng && (
          <div className="rounded-2xl overflow-hidden border border-border h-28 relative group/map">
            <div className="absolute inset-0 bg-primary/5 group-hover/map:bg-transparent transition-colors pointer-events-none z-10" />
            <iframe
              width="100%" height="100%" frameBorder="0" scrolling="no" loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.location.lng - 0.01}%2C${property.location.lat - 0.01}%2C${property.location.lng + 0.01}%2C${property.location.lat + 0.01}&layer=mapnik&marker=${property.location.lat}%2C${property.location.lng}`}
              className="w-full h-full grayscale opacity-80 group-hover/map:grayscale-0 group-hover/map:opacity-100 transition-all duration-500"
            />
          </div>
        )}

        {/* Facilities */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {facilities.slice(0, 3).map((f: string, i: number) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-bold text-foreground capitalize tracking-wide">{f}</span>
            ))}
            {facilities.length > 3 && (
              <span className="px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px] font-bold text-muted-foreground">+{facilities.length - 3}</span>
            )}
          </div>
        )}

        {/* Rejection reason */}
        {property.status === 'rejected' && property.rejectionReason && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive font-medium leading-relaxed">{property.rejectionReason}</p>
          </div>
        )}

        {/* Owner contact */}
        {property.status === 'approved' && !isBuyer && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Verified Owner</div>
              <div className="text-sm font-bold text-foreground">{property.ownerName || 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Inquiry button */}
        {property.status === 'approved' && isBuyer && (
          <button
            onClick={() => onInquiry(property._id, propertyTitle)}
            className="mt-auto w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group/btn"
          >
            <Mail className="w-4 h-4" />
            Send Inquiry
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Nearby Property Side Panel ───────────────────────────────────────────────
function NearbyPropertyPanel({ property, isBuyer, onInquiry, onClose }: {
  property: any; isBuyer: boolean;
  onInquiry: (id: string, title: string) => void;
  onClose: () => void;
}) {
  const formatPrice = (price: any) => {
    if (!price || isNaN(Number(price))) return '₹0';
    const n = Number(price);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  };

  let facilities: string[] = [];
  try {
    if (typeof property.facilities === 'string') facilities = JSON.parse(property.facilities);
    else if (Array.isArray(property.facilities)) facilities = property.facilities;
  } catch { }

  return (
    <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-full">
      {/* Image */}
      <div className="relative h-56 bg-muted flex-shrink-0">
        {property.propertyImages?.[0] ? (
          <img src={property.propertyImages[0]} alt={property.propertyName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-lg transition-all border border-white/10">
          <X className="w-4 h-4" />
        </button>
        <div className="absolute bottom-4 left-4">
          <div className="text-2xl font-display font-black text-white">{formatPrice(property.price)}</div>
          <div className="text-[10px] text-white/80 uppercase tracking-widest font-bold capitalize mt-1">For {property.propertyFor}</div>
        </div>
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold shadow border border-primary-foreground/20">
          {property.distance?.toFixed(1)} km away
        </div>
      </div>

      {/* Details */}
      <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
        <div>
          <h3 className="text-2xl font-display font-black text-foreground capitalize">{property.bhk} {property.propertyType}</h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">{property.propertyName}</p>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            {property.city}{property.address ? ` • ${property.address}` : ''}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Bed, label: 'Beds', value: property.bhk || '—' },
            { icon: Maximize2, label: 'Area', value: `${property.sqft || '—'} sqft` },
            { icon: Navigation, label: 'Distance', value: `${property.distance?.toFixed(1)} km`, iconCls: 'text-primary' },
          ].map(({ icon: Icon, label, value, iconCls }) => (
            <div key={label} className="bg-muted rounded-2xl p-3 text-center border border-border">
              <Icon className={`w-5 h-5 mx-auto mb-1.5 ${iconCls || 'text-primary/70'}`} />
              <div className="text-sm font-bold text-foreground leading-tight">{value}</div>
              <div className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {Array.isArray(facilities) && facilities.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {facilities.slice(0, 8).map((f: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-muted border border-border rounded-xl text-xs font-bold text-foreground capitalize">{f}</span>
              ))}
              {facilities.length > 8 && <span className="px-3 py-1.5 bg-muted border border-border rounded-xl text-xs font-bold text-muted-foreground">+{facilities.length - 8}</span>}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 mt-auto border-t border-border">
          {property.location?.googleMapsUrl && (
            <a href={property.location.googleMapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-colors border border-border">
              <MapPin className="w-4 h-4 text-primary" />
              Maps
            </a>
          )}
          {isBuyer && (
            <button
              onClick={() => onInquiry(property._id, `${property.bhk || ''} ${property.propertyType || 'Property'}`)}
              className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5">
              <Mail className="w-4 h-4" />
              Send Inquiry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState('');

  const [nearbyProperties, setNearbyProperties] = useState<any[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedNearbyProperty, setSelectedNearbyProperty] = useState<any>(null);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [nearbyView, setNearbyView] = useState<'grid' | 'map'>('grid');

  const isBuyer = currentUser?.role === 'buyer';

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
          if (response.data.success) setCurrentUser(response.data.user);
        }
      } catch { setCurrentUser(null); }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await api.get('/properties/approved');
        if (response.data.success) {
          setProperties(response.data.properties);
          setFilteredProperties(response.data.properties);
        }
      } catch { setError('Failed to load properties'); }
      finally { setLoading(false); }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const enableLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation is not supported by your browser'); return; }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        setLocationEnabled(true);
        try {
          const response = await api.get(`/properties/nearby?lat=${lat}&lng=${lng}&radius=15`);
          if (response.data.success) setNearbyProperties(response.data.properties);
        } catch { setLocationError('Failed to fetch nearby properties'); }
        finally { setLocationLoading(false); }
      },
      () => { setLocationError('Unable to get your location. Please allow location access.'); setLocationLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleFilter = (filters: any) => {
    let filtered = [...properties];
    if (filters.city?.trim()) filtered = filtered.filter(p => p.city?.toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.propertyFor) filtered = filtered.filter(p => p.propertyFor?.toLowerCase() === filters.propertyFor.toLowerCase());
    if (filters.bhk) filtered = filtered.filter(p => p.bhk === filters.bhk);
    if (filters.propertyType) filtered = filtered.filter(p => p.propertyType?.toLowerCase() === filters.propertyType.toLowerCase());
    if (filters.minPrice > 0) filtered = filtered.filter(p => !isNaN(Number(p.price)) && Number(p.price) >= filters.minPrice);
    if (filters.maxPrice > 0) filtered = filtered.filter(p => !isNaN(Number(p.price)) && Number(p.price) <= filters.maxPrice);
    setFilteredProperties(filtered);
  };

  const handleClearFilters = () => setFilteredProperties(properties);

  const handleInquiryClick = (propertyId: string, propertyTitle: string) => {
    const token = localStorage.getItem('token');
    if (!token) { alert('Please login to send an inquiry'); return; }
    if (!isBuyer) { alert('Only buyers can send property inquiries'); return; }
    setSelectedPropertyId(propertyId);
    setSelectedPropertyTitle(propertyTitle);
    setIsInquiryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      {/* ── Hero ── */}
      <section className="hero-gradient relative pt-32 pb-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-[-10%] top-[-10%] w-[600px] h-[600px] rounded-full border border-primary/10 pointer-events-none" />
        <div className="absolute right-[-5%] top-[-5%] w-[400px] h-[400px] rounded-full border border-primary/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Discover the Pinnacle of Living</span>
              </div>

              <div>
                <h1 className="font-display text-5xl lg:text-7xl font-black text-foreground leading-[1.05] tracking-tight">
                  Find Your
                  <span className="block text-gradient italic mt-1">Dream Home</span>
                  <span className="block text-4xl lg:text-5xl font-bold text-muted-foreground not-italic mt-3">Effortlessly.</span>
                </h1>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-md font-medium">
                Experience premium verified properties across India. Transparent deals, expert guidance — your perfect home awaits.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="#properties">
                  <button className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1">
                    <Search className="w-5 h-5" />
                    Browse Properties
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/5 text-foreground font-bold text-base transition-all duration-300">
                  <Phone className="w-5 h-5 text-primary" />
                  Contact Us
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { value: `${properties.length}+`, label: 'Premium Listings' },
                  { value: '50+', label: 'Cities Covered' },
                  { value: '₹500M+', label: 'Portfolio Value' },
                ].map(s => (
                  <div key={s.label} className="glass-panel rounded-2xl p-4 text-center">
                    <div className="font-display text-2xl font-black text-gradient">{s.value}</div>
                    <div className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Hero image */}
            <div className="relative lg:block hidden">
              <div className="absolute -inset-6 bg-primary/10 rounded-[2.5rem] blur-3xl" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 dark:border-white/5">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=700&fit=crop"
                  alt="Modern luxury home"
                  className="w-full h-[560px] object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 glass-navbar rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Award className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm">Luxury Assured</div>
                        <div className="text-xs text-muted-foreground font-medium">100% verified estates</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nearby Properties ── */}
      <section className="py-24 bg-background border-t border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 backdrop-blur-sm">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Near You</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-black text-foreground">Properties Nearby</h2>
              <p className="text-muted-foreground mt-3 font-medium max-w-md">Enable your location to discover premium properties in your area</p>
            </div>
            {locationEnabled && nearbyProperties.length > 0 && (
              <div className="flex items-center gap-2 bg-muted rounded-2xl p-1.5 border border-border shadow-sm">
                <button onClick={() => setNearbyView('grid')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${nearbyView === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <List className="w-4 h-4" /> Grid
                </button>
                <button onClick={() => setNearbyView('map')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${nearbyView === 'map' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Map className="w-4 h-4" /> Map
                </button>
              </div>
            )}
          </div>

          {!locationEnabled ? (
            <div className="max-w-md mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-amber-500/30 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="glass-panel rounded-3xl p-12 text-center relative shadow-2xl">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Navigation className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-3xl font-black text-foreground mb-4">Enable Location</h3>
                <p className="text-muted-foreground mb-10 font-medium leading-relaxed">Allow location access to see our curated selection of properties closest to you.</p>
                {locationError && (
                  <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm font-bold">{locationError}</div>
                )}
                <button onClick={enableLocation} disabled={locationLoading}
                  className="flex items-center gap-3 mx-auto px-10 py-5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed">
                  {locationLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Locating…</> : <><Navigation className="w-5 h-5" /> Turn On Location</>}
                </button>
              </div>
            </div>

          ) : locationLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="font-bold text-foreground text-lg tracking-wide">Searching nearby premium properties…</p>
            </div>

          ) : nearbyProperties.length === 0 ? (
            <div className="max-w-md mx-auto text-center glass-panel rounded-3xl p-12 shadow-sm">
              <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="font-display text-2xl font-black text-foreground mb-3">No Nearby Properties</h3>
              <p className="text-muted-foreground font-medium mb-8">Nothing within 15 km. Try exploring all listings below.</p>
              <button onClick={() => { setLocationEnabled(false); setNearbyProperties([]); }}
                className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
                Try Different Location
              </button>
            </div>

          ) : nearbyView === 'grid' ? (
            /* Grid view with side panel for property details */
            <div>
              <div className="flex items-center justify-between mb-8">
                <p className="font-bold text-muted-foreground text-lg">
                  <span className="font-black text-foreground text-xl mr-1">{nearbyProperties.length}</span> premium estates found
                </p>
                <button onClick={() => { setLocationEnabled(false); setNearbyProperties([]); setSelectedNearbyProperty(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-bold hover:bg-muted transition-colors shadow-sm">
                  <X className="w-4 h-4 text-primary" /> Disable Location
                </button>
              </div>

              <div className="nearby-layout">
                {/* Left: property grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {nearbyProperties.map(property => (
                    <div key={property._id}
                      onClick={() => setSelectedNearbyProperty(property)}
                      className={`group cursor-pointer bg-card rounded-3xl border overflow-hidden transition-all duration-500 ${selectedNearbyProperty?._id === property._id ? 'border-primary shadow-2xl shadow-primary/20 scale-[1.02]' : 'border-border shadow-sm hover:shadow-xl hover:-translate-y-1 hover-lift'}`}>
                      <div className="relative h-48 bg-muted overflow-hidden">
                        {property.propertyImages?.[0] ? (
                          <img src={property.propertyImages[0]} alt={property.propertyName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Home className="w-12 h-12 text-muted-foreground/30" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold shadow-sm">
                          {property.distance?.toFixed(1)} km
                        </div>
                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wide border border-white/20">
                          {property.propertyFor}
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="text-white font-display font-black text-2xl leading-none drop-shadow-md">
                            {(() => {
                              const n = Number(property.price);
                              if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
                              if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
                              return `₹${n.toLocaleString('en-IN')}`;
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-card">
                        <div className="font-display font-black text-foreground text-lg capitalize line-clamp-1">{property.bhk} {property.propertyType}</div>
                        <div className="text-sm font-medium text-muted-foreground mt-1 truncate">{property.propertyName}</div>
                        <div className="flex items-center gap-1.5 mt-2.5 text-muted-foreground text-sm font-medium">
                          <MapPin className="w-4 h-4 text-primary" />
                          {property.city}
                        </div>
                        {isBuyer && (
                          <button onClick={e => { e.stopPropagation(); handleInquiryClick(property._id, `${property.bhk} ${property.propertyType}`); }}
                            className="mt-4 w-full py-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300">
                            <Mail className="w-4 h-4" /> Inquire Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: detail panel — sticky, NO z-index issues */}
                {selectedNearbyProperty && (
                  <div className="panel-sticky hidden lg:block">
                    <NearbyPropertyPanel
                      property={selectedNearbyProperty}
                      isBuyer={isBuyer}
                      onInquiry={handleInquiryClick}
                      onClose={() => setSelectedNearbyProperty(null)}
                    />
                  </div>
                )}
              </div>

              {/* Mobile: bottom sheet modal for selected property */}
              {selectedNearbyProperty && (
                <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
                  onClick={() => setSelectedNearbyProperty(null)}>
                  <div className="w-full bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto border-t border-border shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-2" />
                    <NearbyPropertyPanel
                      property={selectedNearbyProperty}
                      isBuyer={isBuyer}
                      onInquiry={handleInquiryClick}
                      onClose={() => setSelectedNearbyProperty(null)}
                    />
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* Map view — full width, no overlay conflicts */
            <div>
              <div className="flex items-center justify-between mb-8">
                <p className="font-bold text-muted-foreground text-lg">
                  <span className="font-black text-foreground text-xl mr-1">{nearbyProperties.length}</span> properties on map
                </p>
                <button onClick={() => { setLocationEnabled(false); setNearbyProperties([]); setSelectedNearbyProperty(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-bold hover:bg-muted transition-colors shadow-sm">
                  <X className="w-4 h-4 text-primary" /> Disable
                </button>
              </div>

              {/* Map + side panel layout when property selected */}
              <div className={`transition-all duration-500 ${selectedNearbyProperty ? 'grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start' : ''}`}>
                <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Map className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm">Interactive Map</div>
                        <div className="text-xs text-muted-foreground font-medium">{nearbyProperties.length} properties near you</div>
                      </div>
                    </div>
                    {userCoords && (
                      <span className="text-xs text-primary font-bold flex items-center gap-1.5 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <Navigation className="w-3.5 h-3.5" />
                        {userCoords.lat.toFixed(3)}, {userCoords.lng.toFixed(3)}
                      </span>
                    )}
                  </div>
                  <MapView
                    properties={nearbyProperties}
                    userCoords={userCoords}
                    height="500px"
                    showInquiry={true}
                    onInquiry={(id, title) => {
                      const token = localStorage.getItem('token');
                      if (!token) { alert('Please login to send an inquiry'); return; }
                      if (!isBuyer) { alert('Only buyers can send property inquiries'); return; }
                      setSelectedPropertyId(id);
                      setSelectedPropertyTitle(decodeURIComponent(title));
                      setIsInquiryModalOpen(true);
                    }}
                    onPropertyClick={property => setSelectedNearbyProperty(property)}
                    selectedProperty={selectedNearbyProperty}
                  />
                </div>

                {/* Side panel for map view — same sticky component, NO modal overlap */}
                {selectedNearbyProperty && (
                  <div className="panel-sticky">
                    <NearbyPropertyPanel
                      property={selectedNearbyProperty}
                      isBuyer={isBuyer}
                      onInquiry={handleInquiryClick}
                      onClose={() => setSelectedNearbyProperty(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── All Properties ── */}
      <section id="properties" className="py-24 bg-muted relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 backdrop-blur-sm">
                <Building className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Featured Listings</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-black text-foreground">Premium Properties</h2>
              <p className="text-muted-foreground mt-3 font-medium">Verified & approved listings across India</p>
            </div>
          </div>

          <PropertyFilters onFilter={handleFilter} />

          {/* Results bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-10 p-5 bg-card rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Results</p>
                <p className="font-black text-xl text-foreground">{filteredProperties.length} <span className="font-medium text-base text-muted-foreground">Properties</span></p>
              </div>
            </div>
            {filteredProperties.length !== properties.length && (
              <button onClick={handleClearFilters}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border bg-card text-foreground text-sm font-bold hover:bg-muted hover:border-primary/50 transition-all duration-300">
                <X className="w-4 h-4 text-primary" /> Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-border" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="font-bold text-foreground text-lg tracking-wide">Finding perfect homes for you…</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 glass-panel rounded-3xl border border-border">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
              <p className="font-display font-black text-2xl text-foreground mb-3">{error}</p>
              <p className="text-muted-foreground font-medium">Please try again later</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="card-grid">
              {filteredProperties.map(property => (
                <PropertyCard key={property._id} property={property} isBuyer={isBuyer} onInquiry={handleInquiryClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass-panel rounded-3xl border border-border">
              <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <p className="font-display font-black text-2xl text-foreground mb-3">No Properties Found</p>
              <p className="text-muted-foreground font-medium mb-8">Try adjusting your search criteria</p>
              <button onClick={handleClearFilters}
                className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all duration-300 shadow-lg shadow-primary/20 hover:-translate-y-1">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Why Choose Us</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-black text-foreground mb-4">Your Trusted Partner</h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto text-lg">Exceptional service and verified properties to help you find your perfect home.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BadgeCheck, title: 'Verified Listings', desc: 'Every property is thoroughly authenticated by our expert team for your peace of mind.', accent: 'primary' },
              { icon: HeartHandshake, title: 'Expert Support', desc: 'Dedicated real estate professionals available 24/7 to guide you every step of the way.', accent: 'amber-500' },
              { icon: TrendingUp, title: 'Best Value', desc: 'Competitive pricing with transparent deals and absolutely no hidden charges.', accent: 'primary' },
            ].map(({ icon: Icon, title, desc, accent }, i) => (
              <div key={title} className="group relative bg-card rounded-3xl border border-border p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className={`relative w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300`}>
                  <Icon className={`w-8 h-8 text-${accent === 'primary' ? 'primary' : accent}`} />
                </div>
                <h3 className="font-display text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden bg-slate-950 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-500/10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <Eye className="w-4 h-4 text-white/70" />
            <span className="text-sm font-bold text-white/90 uppercase tracking-wider">Join 10,000+ happy homeowners</span>
          </div>
          <h2 className="font-display text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Ready to Find Your
            <span className="block text-gradient italic mt-2">Dream Home?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 font-medium leading-relaxed max-w-2xl mx-auto">
            Start your journey today. Browse verified listings, connect with owners, and move into your perfect space.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="#properties">
              <button className="group flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-2xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1">
                <KeyRound className="w-5 h-5" />
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="flex items-center justify-center gap-2 px-10 py-5 rounded-2xl border-2 border-white/20 text-white font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
              <Phone className="w-5 h-5 text-primary" />
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:-translate-y-1 border border-primary-foreground/20"
          aria-label="Back to top"
        >
          <ChevronLeft className="w-6 h-6 rotate-90" />
        </button>
      )}

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        propertyId={selectedPropertyId}
        propertyTitle={selectedPropertyTitle}
      />
    </div>
  );
}