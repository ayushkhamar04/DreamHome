'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Search, X, MapPin, IndianRupee, SlidersHorizontal, Bed, Building2, Tag } from 'lucide-react';

interface PropertyFiltersProps {
  onFilter: (filters: {
    city?: string;
    propertyFor?: string;
    minPrice?: number;
    maxPrice?: number;
    bhk?: string;
    propertyType?: string;
  }) => void;
}

const fieldBase =
  'w-full rounded-2xl bg-muted/60 border border-border px-4 py-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-card transition';

function FieldLabel({ icon: Icon, children }: { icon?: any; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.14em]">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
      {children}
    </label>
  );
}

export default function PropertyFilters({ onFilter }: PropertyFiltersProps) {
  const [city, setCity] = useState('');
  const [propertyFor, setPropertyFor] = useState('');
  const [bhk, setBhk] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      city: city || undefined,
      propertyFor: propertyFor || undefined,
      bhk: bhk || undefined,
      propertyType: propertyType || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const handleReset = () => {
    setCity('');
    setPropertyFor('');
    setBhk('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    onFilter({});
  };

  const hasFilters = city || propertyFor || bhk || propertyType || minPrice || maxPrice;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 mb-12 shadow-[0_18px_50px_-30px_rgba(20,60,40,0.35)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent border border-primary/15 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground leading-tight">Refine your search</h3>
            <p className="text-xs text-muted-foreground font-medium">Find the best place, effortlessly</p>
          </div>
        </div>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-muted-foreground hover:text-primary gap-1.5 hover:bg-accent rounded-full h-9 px-4 font-semibold"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
          {/* City */}
          <div className="sm:col-span-2 xl:col-span-1">
            <FieldLabel icon={MapPin}>Location</FieldLabel>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="City or area…"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={fieldBase + ' pl-10'}
              />
            </div>
          </div>

          {/* Property For */}
          <div>
            <FieldLabel icon={Tag}>For</FieldLabel>
            <select value={propertyFor} onChange={(e) => setPropertyFor(e.target.value)} className={fieldBase + ' cursor-pointer'}>
              <option value="">All</option>
              <option value="sell">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* BHK */}
          <div>
            <FieldLabel icon={Bed}>Rooms</FieldLabel>
            <select value={bhk} onChange={(e) => setBhk(e.target.value)} className={fieldBase + ' cursor-pointer'}>
              <option value="">Any</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="5 BHK">5+ BHK</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <FieldLabel icon={Building2}>Type</FieldLabel>
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={fieldBase + ' cursor-pointer'}>
              <option value="">Any</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <FieldLabel icon={IndianRupee}>Min Price</FieldLabel>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={fieldBase + ' pl-10'}
              />
            </div>
          </div>

          {/* Max Price */}
          <div>
            <FieldLabel icon={IndianRupee}>Max Price</FieldLabel>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={fieldBase + ' pl-10'}
              />
            </div>
          </div>

          {/* Search */}
          <div>
            <Button
              type="submit"
              size="lg"
              className="w-full h-[52px] bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
