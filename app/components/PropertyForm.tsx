'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

const LISTING_CHARGES = {
  sell: {
    apartment: 15000,
    tenament: 30000,
    villa: 50000,
  },
  rent: {
    apartment: 8000,
    tenament: 15000,
    villa: 25000,
  },
};

export default function PropertyForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [propertyType, setPropertyType] = useState('');
  const [propertyFor, setPropertyFor] = useState('');
  const [selectedCharges, setSelectedCharges] = useState<number | null>(null);
  const [locationLat, setLocationLat] = useState<string>('');
  const [locationLng, setLocationLng] = useState<string>('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (propertyType && propertyFor) {
      const charges = LISTING_CHARGES[propertyFor as keyof typeof LISTING_CHARGES]?.[propertyType as keyof typeof LISTING_CHARGES['sell']];
      setSelectedCharges(charges ?? null);
    } else {
      setSelectedCharges(null);
    }
  }, [propertyType, propertyFor]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lat = ((1 - y / rect.height) * 180 - 90).toFixed(6);
    const lng = ((x / rect.width) * 360 - 180).toFixed(6);
    setLocationLat(lat);
    setLocationLng(lng);
    setGoogleMapsUrl(`https://maps.google.com/?q=${lat},${lng}`);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationLat(position.coords.latitude.toFixed(6));
          setLocationLng(position.coords.longitude.toFixed(6));
          setGoogleMapsUrl(`https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`);
          setMapSearchQuery('Current Location');
        },
        (error) => {
          alert('Unable to get your location. Please allow location access.');
        }
      );
    }
  };

  const handleSearchLocation = () => {
    if (mapSearchQuery.trim()) {
      const encodedQuery = encodeURIComponent(mapSearchQuery);
      setGoogleMapsUrl(`https://www.google.com/maps/place/${encodedQuery}`);
      setShowMapPicker(true);
    }
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem('token');

    const facilities = (formData.get('facilities') as string) || '';
    formData.set(
      'facilities',
      JSON.stringify(facilities.split(',').map(f => f.trim()).filter(f => f))
    );

    const txnId = (formData.get('txnId') as string) || '';
    formData.set('paymentDetails', JSON.stringify({ txnId }));

    if (selectedCharges !== null) {
      formData.set('charges', selectedCharges.toString());
    }

    if (locationLat && locationLng) {
      formData.set('locationLat', locationLat);
      formData.set('locationLng', locationLng);
      formData.set('googleMapsUrl', googleMapsUrl);
    }

    try {
      await api.post('/properties/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      setShowSuccess(true);
      if (formRef.current) {
        formRef.current.reset();
      }
      setPropertyType('');
      setPropertyFor('');
      setSelectedCharges(null);
      setLocationLat('');
      setLocationLng('');
      setGoogleMapsUrl('');
    } catch (err: any) {
      console.error('Error submitting property:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccess(false);
    router.push('/my-properties');
  };

  const handleProfileSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.put('/auth/profile', profileData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({ ...user, ...profileData }));
        }
        setProfileEdit(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <form ref={formRef} onSubmit={submitHandler} className="space-y-8">
        {/* Profile Edit Section */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#b04439] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Owner Profile</h3>
                <p className="text-sm text-gray-500">Edit your contact information</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setProfileEdit(!profileEdit)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {profileEdit ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {profileEdit ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b04439] focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b04439] focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b04439] focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  className="w-full md:w-auto px-6 py-2.5 bg-[#b04439] hover:bg-[#8d362e] text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</div>
                <div className="text-sm font-bold text-gray-900">{profileData.name || 'Not set'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</div>
                <div className="text-sm font-bold text-gray-900">{profileData.email || 'Not set'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</div>
                <div className="text-sm font-bold text-gray-900">{profileData.phone || 'Not set'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Property Name */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Property Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="propertyName"
            placeholder="e.g., Sunshine Apartments"
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
          />
        </div>

        {/* Property For - Moved up */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Listing Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`relative flex items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
              propertyFor === 'sell' 
                ? 'border-[#b04439] bg-[#b04439]/5 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="propertyFor"
                value="sell"
                required
                checked={propertyFor === 'sell'}
                onChange={() => setPropertyFor('sell')}
                className="sr-only"
              />
              <div className="text-center">
                <div className={`text-lg font-bold mb-1 ${propertyFor === 'sell' ? 'text-[#b04439]' : 'text-gray-700'}`}>For Sale</div>
                <div className="text-xs text-gray-500">Sell your property</div>
              </div>
            </label>
            <label className={`relative flex items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
              propertyFor === 'rent' 
                ? 'border-[#b04439] bg-[#b04439]/5 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="propertyFor"
                value="rent"
                checked={propertyFor === 'rent'}
                onChange={() => setPropertyFor('rent')}
                className="sr-only"
              />
              <div className="text-center">
                <div className={`text-lg font-bold mb-1 ${propertyFor === 'rent' ? 'text-[#b04439]' : 'text-gray-700'}`}>For Rent</div>
                <div className="text-xs text-gray-500">Rent your property</div>
              </div>
            </label>
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              name="propertyType"
              required
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition bg-white text-gray-800"
            >
              <option value="">Select Type</option>
              <option value="apartment">Apartment</option>
              <option value="tenament">Tenament</option>
              <option value="villa">Villa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Square Feet <span className="text-red-500">*</span>
            </label>
            <input
              name="sqft"
              type="number"
              placeholder="e.g., 1200"
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              name="city"
              placeholder="e.g., Mumbai"
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              BHK <span className="text-red-500">*</span>
            </label>
            <select
              name="bhk"
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition bg-white text-gray-800"
            >
              <option value="">Select BHK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK">5 BHK</option>
            </select>
          </div>
        </div>

        {/* Full Address */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Full Address <span className="text-red-500">*</span>
          </label>
          <input
            name="address"
            placeholder="Complete address with locality and landmark"
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
          />
        </div>

        {/* Google Maps Location */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Property Location</h3>
              <p className="text-sm text-gray-500">Set the exact location on map</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                placeholder="Search location (e.g., Bandra West, Mumbai)"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                My Location
              </button>
            </div>

            {googleMapsUrl && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">Location Set</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  Lat: <span className="font-mono font-bold">{locationLat}</span> | Lng: <span className="font-mono font-bold">{locationLng}</span>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Google Maps
                </a>
              </div>
            )}
          </div>

          <input type="hidden" name="locationLat" value={locationLat} />
          <input type="hidden" name="locationLng" value={locationLng} />
          <input type="hidden" name="googleMapsUrl" value={googleMapsUrl} />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Property Price {propertyFor === 'rent' ? '(Monthly Rent)' : '(Selling Price)'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
            <input
              name="price"
              type="number"
              placeholder={propertyFor === 'rent' ? 'Enter monthly rent' : 'Enter selling price'}
              required
              className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Facilities */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Facilities
          </label>
          <input
            name="facilities"
            placeholder="e.g., Parking, Lift, Security, Gym"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-500 mt-2">Separate facilities with commas</p>
        </div>

        {/* Auto-Selected Listing Charges */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Listing Charges</h3>
              <p className="text-sm text-gray-500">Auto-calculated based on your selection</p>
            </div>
          </div>

          {selectedCharges !== null ? (
            <div className="bg-white rounded-xl p-5 border-2 border-amber-300 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold capitalize">{propertyType}</span>
                    {' '}
                    <span className="text-gray-400">•</span>
                    {' '}
                    <span className="font-semibold capitalize">For {propertyFor}</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-600">{formatCurrency(selectedCharges)}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-sm text-center">
                Select <span className="font-semibold">Listing Type</span> and <span className="font-semibold">Property Type</span> to see charges
              </p>
            </div>
          )}

          <input type="hidden" name="charges" value={selectedCharges?.toString() || ''} />
        </div>

        {/* Owner Info */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Owner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Owner Name <span className="text-red-500">*</span></label>
              <input
                name="ownerName"
                placeholder="Full name"
                defaultValue={profileData.name}
                required
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Owner Email <span className="text-red-500">*</span></label>
              <input
                name="ownerEmail"
                type="email"
                placeholder="email@example.com"
                defaultValue={profileData.email}
                required
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Owner Phone <span className="text-red-500">*</span></label>
              <input
                name="ownerPhone"
                placeholder="10-digit mobile number"
                defaultValue={profileData.phone}
                required
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method <span className="text-red-500">*</span></label>
              <select
                name="paymentMethod"
                required
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition bg-white text-gray-800"
              >
                <option value="">Select Method</option>
                <option value="card">Credit / Debit Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID</label>
              <input
                name="txnId"
                placeholder="Enter transaction ID"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Property Images (5-7 images) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="propertyImages"
              multiple
              accept="image/*"
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#b04439]/10 file:text-[#b04439] hover:file:bg-[#b04439]/20 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">Upload 5-7 high-quality images of your property</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Property Proof Document <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="propertyProof"
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b04439] focus:border-[#b04439] outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#b04439]/10 file:text-[#b04439] hover:file:bg-[#b04439]/20 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">Upload ownership proof (PDF, JPG, PNG)</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || selectedCharges === null}
          className="w-full bg-gradient-to-r from-[#b04439] to-[#8d362e] hover:from-[#8d362e] hover:to-[#6b2a23] text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Property...
            </span>
          ) : (
            'Submit Property for Approval'
          )}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
                <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Property Submitted Successfully!
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Your property has been submitted for approval. You can track its status in the "My Properties" section.
              </p>
              <button
                onClick={handleSuccessOk}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg"
              >
                Go to My Properties
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
