'use client';

import { useState } from 'react';
import { 
  Calendar, MapPin, Home, Bed, DollarSign, FileCheck, Download, 
  AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight, 
  Maximize2, Shield, Phone, Mail, User, CreditCard, Receipt,
  Sparkles, TrendingUp, Award, Star
} from 'lucide-react';
import api from '../lib/api'

export default function PropertyCard({ property }: any) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);

  // Safety checks
  if (!property) return null;
  
  const images = property.propertyImages || [];

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500 text-white';
      case 'rejected':
        return 'bg-rose-500 text-white';
      case 'pending':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-neutral-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4 animate-pulse" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatPrice = (price: any) => {
    if (!price || price === undefined || price === null || isNaN(Number(price))) {
      return '₹0';
    }
    
    try {
      const numPrice = Number(price);
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(numPrice);
    } catch (error) {
      console.error('Price formatting error:', error);
      return '₹0';
    }
  };

  const getFacilities = () => {
    if (!property.facilities) return [];
    
    try {
      if (typeof property.facilities === 'string') {
        const parsed = JSON.parse(property.facilities);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
          return JSON.parse(parsed[0]);
        }
        return Array.isArray(parsed) ? parsed : [];
      }
      
      if (Array.isArray(property.facilities)) {
        if (property.facilities.length > 0 && typeof property.facilities[0] === 'string' && property.facilities[0].startsWith('[')) {
          return JSON.parse(property.facilities[0]);
        }
        return property.facilities;
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing facilities:', error);
      return [];
    }
  };

  const facilities = getFacilities();

  const getReceiptUrl = () => {
    return property.receiptUrl || property.paymentReceipt || property.receipt || null;
  };

  const receiptUrl = getReceiptUrl();

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-500 border border-border/80">
      
      {/* Image Carousel Section */}
      <div 
        className="relative h-64 bg-slate-900 overflow-hidden"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        {images.length > 0 ? (
          <>
            {/* Main Image */}
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={`${property.propertyType || 'Property'} - ${property.bhk || 'N/A'}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent"></div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-slate-800" />
                </button>
              </>
            )}

            {/* Image Counter Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentImageIndex
                        ? 'w-6 h-1.5 bg-accent'
                        : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Status Badge */}
            {property.status && (
              <div className="absolute top-4 right-4">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(property.status)} shadow-md`}>
                  {getStatusIcon(property.status)}
                  <span>{property.status.charAt(0).toUpperCase() + property.status.slice(1)}</span>
                </div>
              </div>
            )}

            {/* Property Type Badge */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-800 text-[10px] font-bold uppercase tracking-wider shadow-md">
                <Home className="w-3.5 h-3.5 text-accent" />
                {property.propertyType || 'Property'}
              </div>
            </div>

            {/* Premium Badge for Approved */}
            {property.status === 'approved' && (
              <div className="absolute top-16 left-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2e7d54] text-white text-xs font-bold shadow-lg">
                  <Award className="w-3.5 h-3.5" />
                  VERIFIED
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <div className="text-center">
              <Home className="w-20 h-20 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 font-medium">No Images Available</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-5">
        
        {/* Title and Price */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-black mb-1 capitalize">
              {property.bhk || 'N/A'} {property.propertyType || 'Property'}
            </h3>
            <h4 className="text-sm font-semibold text-neutral-700">
              {property.propertyName}
            </h4>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-600">
              <MapPin className="w-4 h-4 text-[#2e7d54]" />
              <span className="text-sm font-medium">{property.address ? `${property.address}, ${property.city}` : property.city || 'Unknown'}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#2e7d54]">
                {formatPrice(property.price)}
              </div>
              <div className="text-xs font-medium text-neutral-500 uppercase mt-1">
                For {property.propertyFor || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:border-[#2e7d54] transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Bed className="w-4 h-4 text-[#2e7d54]" />
              <span className="text-xs text-neutral-500 font-medium">Bedrooms</span>
            </div>
            <div className="text-lg font-bold text-black">{property.bhk || 'N/A'}</div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:border-[#2e7d54] transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Maximize2 className="w-4 h-4 text-[#2e7d54]" />
              <span className="text-xs text-neutral-500 font-medium">Area</span>
            </div>
            <div className="text-lg font-bold text-black">{property.sqft || 'N/A'} ft²</div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:border-[#2e7d54] transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-[#2e7d54]" />
              <span className="text-xs text-neutral-500 font-medium">Charges</span>
            </div>
            <div className="text-lg font-bold text-black">₹{property.charges || '0'}</div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:border-[#2e7d54] transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#2e7d54]" />
              <span className="text-xs text-neutral-500 font-medium">Listed</span>
            </div>
            <div className="text-sm font-bold text-black">{formatDate(property.createdAt).split(',')[0]}</div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2e7d54] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">
                Property Address
              </div>
              <p className="text-sm text-black font-medium leading-relaxed">
                {property.address || 'Address not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Facilities */}
        {facilities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2e7d54]" />
              <div className="text-sm font-semibold text-black">
                Amenities
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-sm font-medium text-black hover:border-[#2e7d54] hover:text-[#2e7d54] transition-colors capitalize"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-[#2e7d54]" />
            <div className="text-sm font-semibold text-black">
              Payment Information
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-neutral-500 mb-1 font-medium">Listing Charges</div>
              <div className="text-base font-bold text-black">₹{property.charges || '0'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1 font-medium">Payment Method</div>
              <div className="text-sm font-semibold text-black uppercase">
                {property.paymentMethod || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Reason */}
        {property.status === 'rejected' && property.rejectionReason && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-black mb-1">
                  Rejection Reason
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {property.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {receiptUrl && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#2e7d54] hover:bg-[#246a47] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>Payment Receipt</span>
            </a>
          )}

          {property.status === 'approved' && !receiptUrl && (
            <button
              onClick={async () => {
                if (!confirm('Generate payment receipt now?')) return;
                
                try {
                  const res = await api.post(`/properties/receipt/${property._id}`);
                  if (res.data.success) {
                    window.location.reload();
                  }
                } catch (err) {
                  alert('Failed to generate receipt');
                  console.error(err);
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#2e7d54] hover:bg-[#246a47] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Receipt</span>
            </button>
          )}

          {property.propertyProof && (
            <a
              href={property.propertyProof}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-black hover:bg-neutral-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all ${
                !receiptUrl ? 'col-span-2' : ''
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Property Proof</span>
            </a>
          )}
        </div>

        {/* No Documents Message */}
        {!receiptUrl && !property.propertyProof && property.status !== 'approved' && (
          <div className="text-center py-6 px-4 rounded-xl bg-neutral-50 border-2 border-dashed border-neutral-300">
            <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-neutral-500 font-medium">
              No documents available
            </p>
          </div>
        )}

        {/* Owner Contact - For Approved Properties */}
        {property.status === 'approved' && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2e7d54] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-black">
                  Verified Owner Details
                </div>
                <div className="text-xs text-neutral-500 font-medium">
                  ✓ Identity Confirmed
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-neutral-200">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-neutral-500 font-medium">Owner Name</div>
                  <div className="text-sm font-bold text-black">{property.ownerName || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-neutral-200">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-black" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs text-neutral-500 font-medium">Email Address</div>
                  <div className="text-sm font-bold text-black truncate">{property.ownerEmail || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-neutral-200">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-neutral-500 font-medium">Contact Number</div>
                  <div className="text-sm font-bold text-black">{property.ownerPhone || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}