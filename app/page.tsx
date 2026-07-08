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
import { Reveal, RevealGroup, RevealItem, Tilt, Counter } from '@/components/motion';
import { motion } from 'framer-motion';

const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

// ─── Featured Property Card (Editorial Layout) ─────────────────────────────────
function FeaturedPropertyCard({ property, isBuyer, onInquiry }: {
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
    if (n >= 100000) return `₹${(n / 100005).toFixed(1)}L`;
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

  const facilities = getFacilities();
  const propertyTitle = `${property.bhk || 'N/A'} ${property.propertyType || 'Property'}`;

  return (
    <div
      className="group relative flex flex-col md:flex-row bg-card rounded-[2rem] overflow-hidden border border-border/80 hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.14)] transition-all duration-500 cursor-pointer h-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured ribbon */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <span className="px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-[9px] font-bold tracking-widest uppercase shadow-sm">
          ★ Featured
        </span>
        <span className="px-3.5 py-1.5 rounded-full bg-[#0F172A]/85 backdrop-blur-sm text-[9px] font-bold text-white tracking-widest uppercase border border-white/10 shadow-sm">
          For {property.propertyFor || 'N/A'}
        </span>
      </div>

      {/* Image container */}
      <div className="relative w-full md:w-1/2 h-[260px] md:h-auto overflow-hidden bg-slate-100 flex-shrink-0 min-h-[260px]">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={propertyTitle}
              className={`w-full h-full object-cover transition-transform duration-750 ${isHovered ? 'scale-[1.04]' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0F172A]/70 via-transparent to-transparent" />

            {images.length > 1 && isHovered && (
              <>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(p => (p - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow transition-all z-20">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(p => (p + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow transition-all z-20">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Custom Hover cursor View icon overlay */}
            <div className="absolute inset-0 bg-[#0F172A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
              <span className="px-5 py-2.5 rounded-full bg-accent/90 text-accent-foreground text-[10px] font-bold uppercase tracking-widest scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                View Details
              </span>
            </div>

            {/* Image dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
                {images.slice(0, 5).map((_: any, i: number) => (
                  <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-accent w-5' : 'bg-white/50 w-1.5 hover:bg-white/80'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Building2 className="w-10 h-10 text-slate-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No image</span>
          </div>
        )}
      </div>

      {/* Content container */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-card gap-6">
        <div>
          <div className="flex justify-between items-start gap-4 mb-2">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{property.propertyType}</span>
            <div className="font-mono text-2xl font-bold text-slate-900 leading-none">{formatPrice(property.price)}</div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold font-display text-slate-900 group-hover:text-accent transition-colors duration-300 leading-tight">
            {property.bhk} {property.propertyType}
          </h3>
          {property.propertyName && (
            <p className="text-xs font-semibold text-slate-500 mt-1">{property.propertyName}</p>
          )}
          <div className="flex items-center gap-1.5 mt-3 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{property.address ? `${property.address}, ${property.city}` : property.city || 'Unknown'}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-border/80 animate-in fade-in">
              <Bed className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">BHK</div>
              <div className="font-mono font-bold text-slate-800">{property.bhk || '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-border/80">
              <Maximize2 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Area</div>
              <div className="font-mono font-bold text-slate-800">{property.sqft || '—'} <span className="text-[9px] text-slate-450 font-normal">sqft</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-border/80">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Added</div>
              <div className="font-mono font-bold text-[10px] text-slate-800">{formatDate(property.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Facilities list */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {facilities.slice(0, 4).map((f: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-full bg-slate-50 border border-border/80 text-[10px] font-bold text-slate-650 capitalize tracking-wide">{f}</span>
            ))}
            {facilities.length > 4 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-dashed border-border/80 text-[10px] font-bold text-slate-400">+{facilities.length - 4}</span>
            )}
          </div>
        )}

        {/* Contact or action button */}
        <div className="flex items-center justify-between gap-4 mt-2">
          {property.status === 'approved' && !isBuyer && (
            <div className="flex items-center gap-2 bg-emerald-50/50 border border-emerald-100 rounded-full py-1.5 px-4">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Verified Listing</span>
            </div>
          )}
          
          {property.status === 'approved' && isBuyer && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInquiry(property._id, `${property.bhk} ${property.propertyType}`); }}
              className="ml-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0F172A] hover:bg-[#334155] text-white text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md group/btn"
            >
              <Mail className="w-4 h-4 text-accent" />
              Send Inquiry
              <ArrowRight className="w-4 h-4 text-accent group-hover/btn:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
      className="group relative flex flex-col bg-card rounded-3xl overflow-hidden border border-border/80 hover:shadow-[0_30px_70px_-24px_rgba(15,23,42,0.12)] transition-all duration-500 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-[240px] overflow-hidden bg-slate-100 flex-shrink-0">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={propertyTitle}
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-[1.03]' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />

            {images.length > 1 && isHovered && (
              <>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(p => (p - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow transition-all duration-300">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(p => (p + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow transition-all duration-300">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1.5 rounded-full bg-[#0F172A]/80 backdrop-blur-sm text-[10px] font-bold text-white tracking-wider uppercase border border-white/10 shadow-sm">
                {property.propertyType}
              </span>
            </div>


            {/* Bottom info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="text-2xl font-mono font-bold text-white tracking-tight leading-none drop-shadow-sm">{formatPrice(property.price)}</div>
              <div className="text-[10px] text-white/80 uppercase tracking-widest font-bold mt-1.5">
                For {property.propertyFor || 'N/A'}
              </div>
            </div>

            {/* Image dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1.5">
                {images.slice(0, 5).map((_: any, i: number) => (
                  <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-accent w-5' : 'bg-white/50 w-1.5 hover:bg-white/80'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Home className="w-10 h-10 text-slate-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-5 bg-card">
        <div>
          <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-accent transition-colors duration-300 line-clamp-1">
            {property.bhk} {property.propertyType}
          </h3>
          {property.propertyName && (
            <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1">{property.propertyName}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{property.address ? `${property.address}, ${property.city}` : property.city || 'Unknown'}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-slate-655 py-3 border-y border-border/80">
          <div className="flex flex-col items-center gap-1">
            <Bed className="w-4 h-4 text-accent" />
            <span className="font-mono font-bold">{property.bhk || '—'} Beds</span>
          </div>
          <div className="w-px h-6 bg-border/80" />
          <div className="flex flex-col items-center gap-1">
            <Maximize2 className="w-4 h-4 text-accent" />
            <span className="font-mono font-bold">{property.sqft || '—'} <span className="text-[10px] text-slate-500 font-normal">sqft</span></span>
          </div>
          <div className="w-px h-6 bg-border/80" />
          <div className="flex flex-col items-center gap-1">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="font-mono font-bold text-[10px]">{formatDate(property.createdAt)}</span>
          </div>
        </div>

        {/* Mini map */}
        {property.location?.lat && property.location?.lng && (
          <div className="rounded-2xl overflow-hidden border border-border/85 h-28 relative group/map">
            <div className="absolute inset-0 bg-accent/5 group-hover/map:bg-transparent transition-colors pointer-events-none z-10" />
            <iframe
              width="100%" height="100%" frameBorder="0" scrolling="no" loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.location.lng - 0.01}%2C${property.location.lat - 0.01}%2C${property.location.lng + 0.01}%2C${property.location.lat + 0.01}&layer=mapnik&marker=${property.location.lat}%2C${property.location.lng}`}
              className="w-full h-full grayscale opacity-80 group-hover/map:grayscale-0 group-hover/map:opacity-100 transition-all duration-500"
            />
          </div>
        )}

        {/* Facilities */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {facilities.slice(0, 3).map((f: string, i: number) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 capitalize tracking-wide">{f}</span>
            ))}
            {facilities.length > 3 && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-border/80 text-[10px] font-bold text-slate-500">+{facilities.length - 3}</span>
            )}
          </div>
        )}

        {/* Rejection reason */}
        {property.status === 'rejected' && property.rejectionReason && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 font-bold leading-relaxed">{property.rejectionReason}</p>
          </div>
        )}

        {/* Owner contact */}
        {property.status === 'approved' && !isBuyer && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Verified Owner</div>
              <div className="text-xs font-bold text-slate-800">{property.ownerName || 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Inquiry button */}
        {property.status === 'approved' && isBuyer && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInquiry(property._id, propertyTitle); }}
            className="mt-auto w-full py-3 rounded-full bg-[#0F172A] hover:bg-[#334155] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow transition-all duration-300 group/btn"
          >
            <Mail className="w-3.5 h-3.5 text-accent" />
            Send Inquiry
            <ArrowRight className="w-3.5 h-3.5 text-accent group-hover/btn:translate-x-1 transition-transform" />
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
    <div className="bg-card rounded-3xl shadow-xl border border-border/80 overflow-hidden flex flex-col max-h-full">
      {/* Image */}
      <div className="relative h-56 bg-slate-900 flex-shrink-0">
        {property.propertyImages?.[0] ? (
          <img src={property.propertyImages[0]} alt={property.propertyName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-10 h-10 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white shadow transition-all border border-white/10">
          <X className="w-4 h-4" />
        </button>
        <div className="absolute bottom-4 left-4">
          <div className="text-2xl font-mono font-bold text-white">{formatPrice(property.price)}</div>
          <div className="text-[10px] text-white/80 uppercase tracking-widest font-bold mt-1">For {property.propertyFor}</div>
        </div>
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold shadow border border-accent/20 tracking-wider uppercase">
          {property.distance?.toFixed(1)} km away
        </div>
      </div>

      {/* Details */}
      <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
        <div>
          <h3 className="text-xl font-bold font-display text-slate-900 capitalize leading-tight">{property.bhk} {property.propertyType}</h3>
          {property.propertyName && (
            <p className="text-xs font-semibold text-slate-500 mt-1">{property.propertyName}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2.5 text-slate-500 text-xs">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            {property.city}{property.address ? ` • ${property.address}` : ''}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Bed, label: 'Beds', value: property.bhk || '—' },
            { icon: Maximize2, label: 'Area', value: `${property.sqft || '—'} sqft` },
            { icon: Navigation, label: 'Distance', value: `${property.distance?.toFixed(1)} km`, iconCls: 'text-accent' },
          ].map(({ icon: Icon, label, value, iconCls }) => (
            <div key={label} className="bg-slate-50 rounded-2xl p-3 text-center border border-border/80">
              <Icon className={`w-4 h-4 mx-auto mb-1.5 ${iconCls || 'text-accent'}`} />
              <div className="text-xs font-mono font-bold text-slate-800 leading-tight">{value}</div>
              <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {Array.isArray(facilities) && facilities.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Facilities</p>
            <div className="flex flex-wrap gap-1.5">
              {facilities.slice(0, 8).map((f: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 border border-border/80 text-[10px] font-bold text-slate-600 capitalize">{f}</span>
              ))}
              {facilities.length > 8 && <span className="px-3 py-1 rounded-lg bg-slate-100 border border-border/80 text-[10px] font-bold text-slate-500">+{facilities.length - 8}</span>}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 mt-auto border-t border-border/80">
          {property.location?.googleMapsUrl && (
            <a href={property.location.googleMapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all border border-border/80 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              Maps
            </a>
          )}
          {isBuyer && (
            <button
              onClick={() => onInquiry(property._id, `${property.bhk || ''} ${property.propertyType || 'Property'}`)}
              className="flex-1 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#334155] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all duration-300 hover:-translate-y-0.5">
              <Mail className="w-3.5 h-3.5 text-accent" />
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

  const [heroCity, setHeroCity] = useState('');
  const [heroFor, setHeroFor] = useState('');

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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilter({ city: heroCity || undefined, propertyFor: heroFor || undefined });
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

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

      <section className="relative pt-32 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-background">
        {/* soft decorative gold/slate washes */}
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-[400px] h-[400px] rounded-full bg-slate-900/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

            {/* Left */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="space-y-8"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{properties.length}+ verified homes live now</span>
                </div>
              </motion.div>

              <motion.h1
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="font-display text-4xl sm:text-5xl lg:text-[4rem] font-semibold text-foreground leading-[1.02] tracking-tight"
              >
                Find your <span className="font-serif italic text-accent font-normal">dream home</span>, the calmer way.
              </motion.h1>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="text-base text-slate-500 leading-relaxed max-w-md font-medium"
              >
                Verified, transparent listings across India — with expert guidance every step of the way. Your perfect space is closer than you think.
              </motion.p>

              {/* Hero search */}
              <motion.form
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                onSubmit={handleHeroSearch}
                className="flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-card border border-border/80 shadow-[0_20px_50px_-16px_rgba(15,23,42,0.06)] max-w-lg"
              >
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                  <input
                    value={heroCity}
                    onChange={(e) => setHeroCity(e.target.value)}
                    placeholder="Search city or area…"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-transparent text-sm font-semibold text-foreground placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <select
                  value={heroFor}
                  onChange={(e) => setHeroFor(e.target.value)}
                  className="h-11 px-3 rounded-xl bg-slate-50 border border-border/80 text-xs font-bold uppercase tracking-wider text-slate-705 focus:outline-none focus:ring-1 focus:ring-accent/40 cursor-pointer"
                >
                  <option value="">Buy or Rent</option>
                  <option value="sell">Buy</option>
                  <option value="rent">Rent</option>
                </select>
                <button className="group h-11 px-6 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all hover:-translate-y-0.5">
                  <Search className="w-4 h-4 text-accent" />
                  Search
                </button>
              </motion.form>

              {/* Stats */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
                {[
                  { to: Math.max(properties.length, 1), suffix: '+', label: 'Live listings' },
                  { to: 50, suffix: '+', label: 'Cities' },
                  { to: 10, suffix: 'k+', label: 'Happy clients' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-card border border-border/80 p-3.5 text-center shadow-sm">
                    <Counter to={s.to} suffix={s.suffix} className="font-mono text-xl font-bold text-[#0F172A]" />
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — 3D tilt image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-6 bg-accent/5 rounded-[2.5rem] blur-3xl" />
              <Tilt max={7} glare className="relative rounded-[1.75rem] overflow-hidden shadow-2xl border border-white/40">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=700&fit=crop"
                  alt="Modern home"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/75 via-transparent to-transparent" />

                {/* Floating verified card */}
                <motion.div
                  style={{ transform: 'translateZ(50px)' }}
                  className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-white/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-md">
                        <BadgeCheck className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-tight">100% Verified</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Every listing, checked</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                    </div>
                  </div>
                </motion.div>
              </Tilt>

              {/* floating price chip */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 bg-card rounded-2xl border border-border shadow-xl px-4 py-3"
              >
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Starting from</div>
                <div className="font-mono text-lg font-bold text-accent">₹42L</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Nearby Properties ── */}
      <section className="py-16 lg:py-20 bg-background border-t border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <Reveal>
              <span className="section-eyebrow mb-4"><Navigation className="w-3.5 h-3.5" /> Near You</span>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mt-4">Properties Nearby</h2>
              <p className="text-muted-foreground mt-2 font-medium max-w-md">Enable your location to discover premium properties in your area</p>
            </Reveal>
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
            <div className="max-w-sm mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-emerald-500/30 rounded-[1.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="glass-panel rounded-2xl p-6 text-center relative shadow-xl border border-border bg-white/80 backdrop-blur-md">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">Enable Location</h3>
                <p className="text-muted-foreground mb-6 text-xs font-medium leading-relaxed">Allow location access to see our curated selection of properties closest to you.</p>
                {locationError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">{locationError}</div>
                )}
                <button onClick={enableLocation} disabled={locationLoading}
                  className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {locationLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Locating…</> : <><Navigation className="w-3.5 h-3.5" /> Turn On Location</>}
                </button>
              </div>
            </div>

          ) : locationLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="font-bold text-foreground text-sm tracking-wide">Searching nearby premium properties…</p>
            </div>

          ) : nearbyProperties.length === 0 ? (
            <div className="max-w-sm mx-auto text-center glass-panel rounded-2xl p-6 shadow-md border border-border bg-white/80 backdrop-blur-md">
              <Search className="w-10 h-10 text-muted-foreground/45 mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-2">No Nearby Properties</h3>
              <p className="text-muted-foreground text-xs font-medium mb-6">Nothing within 15 km. Try exploring all listings below.</p>
              <button onClick={() => { setLocationEnabled(false); setNearbyProperties([]); }}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all shadow-md hover:-translate-y-0.5">
                Try Different Location
              </button>
            </div>

          ) : nearbyView === 'grid' ? (
            /* Grid view with side panel for property details */
            <div>
              <div className="flex items-center justify-between mb-8">
                <p className="font-bold text-muted-foreground text-lg">
                  <span className="font-bold text-foreground text-xl mr-1">{nearbyProperties.length}</span> premium estates found
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
                      className={`group cursor-pointer bg-card rounded-3xl border overflow-hidden transition-all duration-500 ${selectedNearbyProperty?._id === property._id ? 'border-accent shadow-xl scale-[1.02]' : 'border-border/80 shadow-sm hover:shadow-lg hover:-translate-y-1'}`}>
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        {property.propertyImages?.[0] ? (
                          <img src={property.propertyImages[0]} alt={property.propertyName}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Home className="w-10 h-10 text-slate-400" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold shadow-sm uppercase tracking-wider">
                          {property.distance?.toFixed(1)} km
                        </div>
                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-[#0F172A]/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                          {property.propertyFor}
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="text-white font-mono font-bold text-xl leading-none drop-shadow-sm">
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
                        <div className="font-display font-bold text-slate-900 text-base capitalize line-clamp-1">{property.bhk} {property.propertyType}</div>
                        {property.propertyName && (
                          <div className="text-xs font-semibold text-slate-500 mt-1 truncate">{property.propertyName}</div>
                        )}
                        <div className="flex items-center gap-1.5 mt-2.5 text-slate-500 text-xs font-medium">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          {property.city}
                        </div>
                        {isBuyer && (
                          <button onClick={e => { e.stopPropagation(); handleInquiryClick(property._id, `${property.bhk} ${property.propertyType}`); }}
                            className="mt-4 w-full py-2.5 rounded-full bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> Inquire Now
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
                  <span className="font-bold text-foreground text-xl mr-1">{nearbyProperties.length}</span> properties on map
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
      <section id="properties" className="py-20 lg:py-24 bg-muted relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal className="mb-12">
            <span className="section-eyebrow mb-4"><Building className="w-3.5 h-3.5" /> Featured Listings</span>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mt-4">Premium Properties</h2>
            <p className="text-slate-500 mt-2 font-medium">Verified &amp; approved listings across India</p>
          </Reveal>

          <PropertyFilters onFilter={handleFilter} />

          {/* Results bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-10 p-5 bg-card rounded-3xl border border-border/80 shadow-[0_15px_40px_-20px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center">
                <Home className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Results</p>
                <p className="font-bold text-xl text-[#0F172A] font-mono">{filteredProperties.length} <span className="font-medium text-sm text-slate-500 uppercase tracking-wider ml-1">Properties</span></p>
              </div>
            </div>
            {filteredProperties.length !== properties.length && (
              <button onClick={handleClearFilters}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-border/80 bg-card text-slate-800 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 hover:border-accent/40 transition-all duration-300">
                <X className="w-3.5 h-3.5 text-accent" /> Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
              </div>
              <p className="font-bold text-slate-700 text-sm tracking-wide">Finding perfect homes for you…</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 glass-panel rounded-3xl border border-border/80">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-6" />
              <p className="font-display font-bold text-xl text-foreground mb-3">{error}</p>
              <p className="text-slate-500 font-medium text-sm">Please try again later</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <RevealGroup className="card-grid" stagger={0.06}>
              {filteredProperties.map(property => (
                <RevealItem key={property._id}>
                  <PropertyCard property={property} isBuyer={isBuyer} onInquiry={handleInquiryClick} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <div className="text-center py-24 glass-panel rounded-3xl border border-border/80">
              <Search className="w-12 h-12 text-slate-400/40 mx-auto mb-6" />
              <p className="font-display font-bold text-xl text-foreground mb-2">No Properties Found</p>
              <p className="text-slate-500 text-sm font-medium mb-8">Try adjusting your search criteria</p>
              <button onClick={handleClearFilters}
                className="px-6 py-3 rounded-full bg-[#0F172A] hover:bg-[#334155] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <span className="section-eyebrow mb-4"><Sparkles className="w-3.5 h-3.5" /> Why Choose Us</span>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mt-4 mb-3">Your Trusted Partner</h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm">Exceptional service and verified properties to help you find your perfect home.</p>
          </Reveal>

          <RevealGroup className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BadgeCheck, title: 'Verified Listings', desc: 'Every property is thoroughly authenticated by our expert team for your peace of mind.' },
              { icon: HeartHandshake, title: 'Expert Support', desc: 'Dedicated real estate professionals available 24/7 to guide you every step of the way.' },
              { icon: TrendingUp, title: 'Best Value', desc: 'Competitive pricing with transparent deals and absolutely no hidden charges.' },
            ].map(({ icon: Icon, title, desc }) => (
              <RevealItem key={title} className="group relative bg-card rounded-3xl border border-border/80 p-8 hover:shadow-[0_30px_70px_-24px_rgba(15,23,42,0.08)] hover:border-accent/30 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-accent/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative w-12 h-12 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center mb-6 group-hover:bg-accent transition-all duration-300">
                  <Icon className="w-5 h-5 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3 group-hover:text-accent transition-colors">{title}</h3>
                <p className="text-slate-550 leading-relaxed text-xs font-medium">{desc}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 lg:py-28 relative overflow-hidden bg-[#0F172A] border-t border-slate-800 text-slate-300">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6 backdrop-blur-md">
            <Eye className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Join 10,000+ happy homeowners</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
            Ready to find your
            <span className="block font-serif italic text-accent font-normal mt-2">dream home?</span>
          </h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto font-medium">
            Start your journey today. Browse verified listings, connect with owners, and move into your perfect space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#properties">
              <button className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-accent/10 transition-all duration-300 hover:-translate-y-0.5">
                <KeyRound className="w-4 h-4 text-accent-foreground" />
                Get Started Today
                <ArrowRight className="w-4 h-4 text-accent-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-900 transition-all duration-300">
              <Phone className="w-4 h-4 text-accent" />
              Contact Us
            </button>
          </div>
        </Reveal>
      </section>

      <Footer />

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#0F172A] hover:bg-[#334155] text-white shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 border border-slate-800"
          aria-label="Back to top"
        >
          <ChevronLeft className="w-5 h-5 rotate-90 text-accent" />
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