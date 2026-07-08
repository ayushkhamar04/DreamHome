'use client';

import React from "react"

import Link from 'next/link';
import { Heart, MapPin, Maximize2, Bed, Bath, ArrowRight, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  city: string;
  sqftArea: number;
  bedrooms: number;
  bathrooms: number;
  images?: string[];
  image?: string;
  listingType: string;
}

export default function PropertyCard({
  id,
  title,
  price,
  city,
  sqftArea,
  bedrooms,
  bathrooms,
  images,
  image,
  listingType,
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  
  const propertyImages = images && images.length > 0 ? images : [image || 'https://images.unsplash.com/photo-1559599810-46d1512c080f?w=500&h=400&fit=crop'];
  const currentImage = propertyImages[imageIndex];

  const formatPrice = (price: number) => {
    if (listingType === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  return (
    <Link href={`/property/${id}`}>
      <div className="bg-card rounded-3xl overflow-hidden border border-border/80 hover:border-accent/30 hover:shadow-[0_30px_70px_-24px_rgba(15,23,42,0.12)] transition-all duration-500 cursor-pointer group h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-72 overflow-hidden bg-slate-100">
          <img
            src={currentImage || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
          
          {/* Image Counter */}
          {propertyImages.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-[#0F172A]/80 text-[#FAFAF8] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1.5 backdrop-blur-sm">
              <ImageIcon className="w-3 h-3 text-accent" />
              {imageIndex + 1} / {propertyImages.length}
            </div>
          )}
          
          {/* Next Image Button */}
          {propertyImages.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-3 bottom-3 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
            {listingType === 'both' ? 'BUY/RENT' : listingType === 'buy' ? 'BUY' : 'RENT'}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className="absolute top-4 right-4 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-105"
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest">{city}</p>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-accent transition-colors duration-300 line-clamp-2 text-balance mb-4">
            {title}
          </h3>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-2 mb-5 pb-5 border-b border-border/80">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-xs text-slate-600 font-mono font-bold">{bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-xs text-slate-600 font-mono font-bold">{bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-xs text-slate-600 font-mono font-bold">{(sqftArea/1000).toFixed(1)}k sqft</span>
            </div>
          </div>

          {/* Price and Button */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-xl font-bold font-mono text-[#0F172A]">
                {formatPrice(price)}
              </p>
            </div>
            <Button size="sm" className="bg-[#0F172A] hover:bg-[#334155] text-white hover:text-white rounded-full font-bold px-4 py-2 h-9 text-xs uppercase tracking-wider shadow-sm transition-all duration-300 flex items-center gap-1.5">
              View <ArrowRight className="w-3 h-3 text-accent" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
