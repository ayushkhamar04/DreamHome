'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Search, X, MapPin, DollarSign, Filter, Bed, Building2 } from 'lucide-react';

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
    <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 mb-12 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-[#b04439]" />
        <h3 className="text-lg font-bold text-gray-900">Search Filters</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          {/* City Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="City or neighborhood..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] transition"
              />
            </div>
          </div>

          {/* Property For */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Property For
            </label>
            <select
              value={propertyFor}
              onChange={(e) => setPropertyFor(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] transition cursor-pointer"
            >
              <option value="">All</option>
              <option value="sell">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* BHK Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              <Bed className="w-3 h-3 inline mr-1" />
              BHK
            </label>
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] transition cursor-pointer"
            >
              <option value="">Any</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="5 BHK">5+ BHK</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              <Building2 className="w-3 h-3 inline mr-1" />
              Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] transition cursor-pointer"
            >
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
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Min Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="₹0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] transition"
              />
            </div>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Max Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="₹ Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] transition"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-[#b04439] to-[#8d362e] hover:from-[#8d362e] hover:to-[#6b2a23] text-white gap-2 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Reset Button */}
        {hasFilters && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              className="text-gray-500 hover:text-[#b04439] gap-1 hover:bg-rose-50 rounded-xl"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
