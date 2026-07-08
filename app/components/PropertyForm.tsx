'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';

// Fix default marker icon for webpack/next
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

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
  const [paymentMethod, setPaymentMethod] = useState('');
  const [generatedTxnId, setGeneratedTxnId] = useState('');

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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const updatePickedLocation = (lat: number, lng: number) => {
    const formattedLat = lat.toFixed(6);
    const formattedLng = lng.toFixed(6);
    setLocationLat(formattedLat);
    setLocationLng(formattedLng);
    setGoogleMapsUrl(`https://maps.google.com/?q=${formattedLat},${formattedLng}`);

    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updatePickedLocation(position.lat, position.lng);
      });
      markerInstanceRef.current = marker;
    }

    map.setView([lat, lng], map.getZoom() < 13 ? 15 : map.getZoom());
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = locationLat ? parseFloat(locationLat) : 20.5937;
    const initialLng = locationLng ? parseFloat(locationLng) : 78.9629;
    const initialZoom = locationLat ? 15 : 5;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([initialLat, initialLng], initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updatePickedLocation(lat, lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerInstanceRef.current = null;
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updatePickedLocation(latitude, longitude);
          setMapSearchQuery('Current Location');
        },
        (error) => {
          alert('Unable to get your location. Please allow location access.');
        }
      );
    }
  };

  const handleSearchLocation = async () => {
    if (!mapSearchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        updatePickedLocation(latitude, longitude);
      } else {
        alert('Location not found. Please try a different search.');
      }
    } catch (err) {
      console.error('Error searching location:', err);
      alert('Failed to search location. Please try again.');
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

    let paymentDetails: any = {};
    const autoTxnId = `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedTxnId(autoTxnId);
    paymentDetails.txnId = autoTxnId;

    if (paymentMethod === 'upi') {
      paymentDetails.upiId = (formData.get('upiId') as string) || '';
    } else if (paymentMethod === 'card') {
      paymentDetails.cardHolderName = (formData.get('cardHolderName') as string) || '';
      paymentDetails.cardNumber = (formData.get('cardNumber') as string) || '';
      paymentDetails.cardExpiry = (formData.get('cardExpiry') as string) || '';
      paymentDetails.cardCvv = (formData.get('cardCvv') as string) || '';
    } else if (paymentMethod === 'netbanking') {
      paymentDetails.bankName = (formData.get('bankName') as string) || '';
      paymentDetails.accountNumber = (formData.get('accountNumber') as string) || '';
      paymentDetails.ifscCode = (formData.get('ifscCode') as string) || '';
    }

    formData.set('paymentDetails', JSON.stringify(paymentDetails));

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
      setPaymentMethod('');
      if (markerInstanceRef.current) {
        markerInstanceRef.current.remove();
        markerInstanceRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([20.5937, 78.9629], 5);
      }
    } catch (err: any) {
      console.error('Error submitting property:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccess(false);
    setGeneratedTxnId('');
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
      <form ref={formRef} onSubmit={submitHandler} className="space-y-8 text-left">
        {/* Profile Edit Section */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Owner Profile</h3>
                <p className="text-xs font-semibold text-slate-500">Edit your contact information</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setProfileEdit(!profileEdit)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-white border border-border/80 hover:bg-slate-50 text-slate-800 transition-colors shadow-sm self-start sm:self-center"
            >
              {profileEdit ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {profileEdit ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#334155] text-white font-bold rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-border/80 shadow-sm">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name</div>
                <div className="text-xs font-bold text-slate-800">{profileData.name || 'Not set'}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-border/80 shadow-sm">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</div>
                <div className="text-xs font-bold text-slate-800">{profileData.email || 'Not set'}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-border/80 shadow-sm">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</div>
                <div className="text-xs font-bold text-slate-800">{profileData.phone || 'Not set'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Property Name */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Property Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="propertyName"
            placeholder="e.g., Sunshine Apartments"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
          />
        </div>

        {/* Property For - Listing Type */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Listing Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`relative flex items-center justify-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${
              propertyFor === 'sell' 
                ? 'border-accent bg-accent/5 shadow-sm' 
                : 'border-border/85 hover:border-slate-300'
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
                <div className={`text-sm font-bold mb-1 uppercase tracking-wider ${propertyFor === 'sell' ? 'text-accent' : 'text-slate-700'}`}>For Sale</div>
                <div className="text-[10px] font-semibold text-slate-500">Sell your property</div>
              </div>
            </label>
            <label className={`relative flex items-center justify-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${
              propertyFor === 'rent' 
                ? 'border-accent bg-accent/5 shadow-sm' 
                : 'border-border/85 hover:border-slate-300'
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
                <div className={`text-sm font-bold mb-1 uppercase tracking-wider ${propertyFor === 'rent' ? 'text-accent' : 'text-slate-700'}`}>For Rent</div>
                <div className="text-[10px] font-semibold text-slate-500">Rent your property</div>
              </div>
            </label>
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Property Type <span className="text-rose-500">*</span>
            </label>
            <select
              name="propertyType"
              required
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
            >
              <option value="">Select Type</option>
              <option value="apartment">Apartment</option>
              <option value="tenament">Tenament</option>
              <option value="villa">Villa</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Square Feet <span className="text-rose-500">*</span>
            </label>
            <input
              name="sqft"
              type="number"
              placeholder="e.g., 1200"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              name="city"
              placeholder="e.g., Mumbai"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              BHK <span className="text-rose-500">*</span>
            </label>
            <select
              name="bhk"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
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
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Full Address <span className="text-rose-500">*</span>
          </label>
          <input
            name="address"
            placeholder="Complete address with locality and landmark"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
          />
        </div>

        {/* Google Maps Location */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-border/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Property Location</h3>
              <p className="text-xs font-semibold text-slate-500">Set the exact location on map</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                placeholder="Search location (e.g., Bandra West, Mumbai)"
                className="flex-1 px-4 py-2.5 bg-white border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#334155] text-white font-bold rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="px-5 py-2.5 bg-white border border-border/80 hover:bg-slate-50 text-slate-800 font-bold rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  My Location
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Map Picker */}
            <div className="relative">
              <div 
                ref={mapContainerRef} 
                className="w-full h-72 rounded-2xl border border-border/80 shadow-sm z-0" 
                style={{ minHeight: '280px' }}
              />
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-[9px] text-slate-500 font-bold uppercase tracking-wider px-2 py-1 rounded shadow border border-border pointer-events-none z-[1000]">
                Click map or drag pin to adjust
              </div>
            </div>

            {googleMapsUrl && (
              <div className="bg-white rounded-2xl p-4 border border-border/80 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Location Set</span>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mb-2">
                  Lat: <span className="font-mono font-bold text-slate-800">{locationLat}</span> | Lng: <span className="font-mono font-bold text-slate-800">{locationLng}</span>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px] uppercase tracking-wider border border-emerald-250 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Property Price {propertyFor === 'rent' ? '(Monthly Rent)' : '(Selling Price)'} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input
              name="price"
              type="number"
              placeholder={propertyFor === 'rent' ? 'Enter monthly rent' : 'Enter selling price'}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Facilities */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Facilities
          </label>
          <input
            name="facilities"
            placeholder="e.g., Parking, Lift, Security, Gym"
            className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
          />
          <p className="text-[10px] font-semibold text-slate-400 mt-2">Separate facilities with commas</p>
        </div>

        {/* Auto-Selected Listing Charges */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-border/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Listing Charges</h3>
              <p className="text-xs font-semibold text-slate-500">Auto-calculated based on your selection</p>
            </div>
          </div>

          {selectedCharges !== null ? (
            <div className="bg-white rounded-2xl p-5 border-2 border-accent/40 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span className="capitalize">{propertyType}</span>
                    {' '}
                    <span className="text-gray-300">•</span>
                    {' '}
                    <span className="capitalize">For {propertyFor}</span>
                  </div>
                  <div className="text-3xl font-bold text-accent font-mono">{formatCurrency(selectedCharges)}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-border/80">
              <p className="text-slate-400 font-semibold text-xs text-center">
                Select <span className="font-bold text-slate-650">Listing Type</span> and <span className="font-bold text-slate-650">Property Type</span> to see charges
              </p>
            </div>
          )}

          <input type="hidden" name="charges" value={selectedCharges?.toString() || ''} />
        </div>

        {/* Owner Info */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-border/80">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Owner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Owner Name <span className="text-rose-500">*</span></label>
              <input
                name="ownerName"
                placeholder="Full name"
                defaultValue={profileData.name}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Owner Email <span className="text-rose-500">*</span></label>
              <input
                name="ownerEmail"
                type="email"
                placeholder="email@example.com"
                defaultValue={profileData.email}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Owner Phone <span className="text-rose-500">*</span></label>
              <input
                name="ownerPhone"
                placeholder="10-digit mobile number"
                defaultValue={profileData.phone}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-border/80">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method <span className="text-rose-500">*</span></label>
              <select
                name="paymentMethod"
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
              >
                <option value="">Select Method</option>
                <option value="card">Credit / Debit Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            {/* Conditional Payment Method Fields */}
            {paymentMethod === 'upi' && (
              <div className="border-t border-slate-100 pt-4 animate-in fade-in duration-300">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    UPI ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    required
                    placeholder="username@bank"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-4 border-t border-slate-100 pt-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Card Holder Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardHolderName"
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Card Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      required
                      placeholder="1234567812345678"
                      pattern="\d{16}"
                      title="Please enter a 16-digit card number"
                      maxLength={16}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Expiry Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardExpiry"
                      required
                      placeholder="MM/YY"
                      pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                      title="Please enter in MM/YY format"
                      maxLength={5}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      CVV <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="cardCvv"
                      required
                      placeholder="***"
                      pattern="\d{3,4}"
                      title="Please enter a 3 or 4 digit CVV"
                      maxLength={4}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 border-t border-slate-100 pt-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Bank Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      required
                      placeholder="e.g. State Bank of India"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      required
                      placeholder="Enter account number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    IFSC Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    required
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Property Images (5-7 images) <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              name="propertyImages"
              multiple
              accept="image/*"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent/50 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-accent/15 file:text-accent hover:file:bg-accent/25 cursor-pointer transition-all"
            />
            <p className="text-[10px] font-semibold text-slate-400 mt-2">Upload 5-7 high-quality images of your property</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Property Proof Document <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              name="propertyProof"
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent/50 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-accent/15 file:text-accent hover:file:bg-accent/25 cursor-pointer transition-all"
            />
            <p className="text-[10px] font-semibold text-slate-400 mt-2">Upload ownership proof (PDF, JPG, PNG)</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || selectedCharges === null}
          className="w-full bg-[#0F172A] hover:bg-[#334155] text-white rounded-full font-bold h-12 text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
              Submitting Property...
            </>
          ) : (
            'Submit Property for Approval'
          )}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2rem] border border-border/80 shadow-xl max-w-md w-full p-8 transform transition-all animate-in zoom-in-95 duration-350">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 mb-3">
                Property Submitted Successfully!
              </h3>
              {generatedTxnId && (
                <div className="bg-emerald-50/50 rounded-2xl p-3.5 mb-6 inline-block w-full border border-emerald-100">
                  <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider block mb-1">Generated Transaction ID</span>
                  <span className="text-base font-mono font-bold text-emerald-900 select-all">{generatedTxnId}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 font-semibold mb-8 leading-relaxed">
                Your property has been submitted for approval. You can track its status in the "My Properties" section.
              </p>
              <button
                onClick={handleSuccessOk}
                className="w-full bg-[#0F172A] hover:bg-[#334155] text-white rounded-full font-bold h-11 text-xs uppercase tracking-wider transition-all shadow-sm"
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
