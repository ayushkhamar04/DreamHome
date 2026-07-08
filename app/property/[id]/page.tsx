'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/app/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Heart, Phone, Mail, MapPin, Maximize2, Bed, Check, 
  ChevronLeft, ChevronRight, Share2, Loader2, Home 
} from 'lucide-react';

export default function PropertyDetails() {
  const params = useParams();
  const id = params?.id;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        if (response.data.success) {
          setProperty(response.data.property);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inquiries', {
        propertyId: id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      alert('Inquiry sent successfully! The owner will contact you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setShowContactForm(false);
    } catch (err: any) {
      console.error('Error sending inquiry:', err);
      alert(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    }
  };

  const handleNextImage = () => {
    if (!property?.propertyImages?.length) return;
    setSelectedImage((prev) => (prev + 1) % property.propertyImages.length);
  };

  const handlePrevImage = () => {
    if (!property?.propertyImages?.length) return;
    setSelectedImage((prev) => (prev - 1 + property.propertyImages.length) % property.propertyImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between animate-fadeIn">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading property details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <MapPin className="w-16 h-16 text-muted-foreground animate-bounce" />
          <h2 className="text-2xl font-bold text-foreground">Property Not Found</h2>
          <p className="text-muted-foreground">The property you are looking for does not exist or has been removed.</p>
          <Link href="/">
            <Button className="mt-2">Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.propertyImages || [];
  const description = `This beautiful ${property.bhk} ${property.propertyType} is located in the city of ${property.city}. It offers a spacious layout of ${property.sqft.toLocaleString()} Sq.Ft. The property comes with premium features and amenities, including ${property.facilities?.join(', ') || 'essential facilities'}. Ideal for anyone looking for a comfortable living space. Contact the owner today to schedule a tour.`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-accent hover:text-slate-800 mb-8 font-bold text-xs uppercase tracking-wider transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Images Section */}
          <div className="lg:col-span-2 space-y-5">
            {/* Main Image Gallery */}
            <div className="relative h-96 md:h-[520px] rounded-3xl overflow-hidden bg-slate-900 group shadow-lg border border-border/80">
              <img
                src={images[selectedImage] || 'https://images.unsplash.com/photo-1559599810-46d1512c080f?w=1200&h=600&fit=crop'}
                alt={property.propertyName}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
              
              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white text-slate-800 rounded-full shadow transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white text-slate-800 rounded-full shadow transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 0 && (
                <div className="absolute bottom-6 left-6 bg-[#0F172A]/80 text-[#FAFAF8] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">
                  {selectedImage + 1} / {images.length}
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-6 right-6 flex gap-2.5">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="w-10 h-10 bg-white/95 hover:bg-white rounded-full shadow flex items-center justify-center transition hover:scale-105"
                >
                  <Heart
                    className={`w-4 h-4 transition-all duration-300 ${
                      isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400'
                    }`}
                  />
                </button>
                <button className="w-10 h-10 bg-white/95 hover:bg-white rounded-full shadow flex items-center justify-center transition hover:scale-105">
                  <Share2 className="w-4 h-4 text-slate-800" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 p-2 bg-slate-100/50 rounded-2xl border border-border/80">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition transform hover:scale-105 ${
                      selectedImage === index
                        ? 'border-accent ring-2 ring-accent/20 shadow-md'
                        : 'border-border/80 hover:border-accent/40'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Property Details */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 leading-tight mb-2">
                    {property.propertyName}
                  </h1>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="font-semibold">{property.address}, {property.city}</span>
                  </div>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-3xl border border-border/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bed className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Layout</p>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                      {property.bhk ? (property.bhk.toUpperCase().includes('BHK') ? property.bhk : `${property.bhk} BHK`) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Type</p>
                    <p className="text-sm font-bold text-slate-900 capitalize mt-1.5">{property.propertyType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center flex-shrink-0">
                    <Maximize2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Area</p>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                      {property.sqft.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">sqft</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-display text-slate-900">About This Property</h2>
                <p className="text-slate-550 leading-relaxed text-sm font-medium">{description}</p>
              </div>

              {/* Amenities */}
              {property.facilities && property.facilities.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold font-display text-slate-900">Amenities & Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {property.facilities.map((amenity: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-border/80 hover:border-accent/20 transition duration-300"
                      >
                        <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-slate-800 text-sm font-semibold capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Map Section */}
              {property.location && property.location.lat && property.location.lng && (
                <div className="border-t border-border/80 pt-8 space-y-4">
                  <h2 className="text-xl font-bold font-display text-slate-900">Location</h2>
                  <div className="rounded-3xl overflow-hidden border border-border/80 shadow-sm h-96">
                    <iframe
                      src={`https://maps.google.com/maps?q=${property.location.lat},${property.location.lng}&z=15&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      title="Google Maps Location"
                    />
                  </div>
                  {property.location.googleMapsUrl && (
                    <a
                      href={property.location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-accent hover:text-slate-900 font-bold uppercase tracking-wider text-xs transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Open in Google Maps
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-card rounded-3xl border border-border/80 p-8 mb-6 sticky top-24 shadow-md">
              <div className="mb-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">List Price</p>
                <h3 className="text-3xl font-bold font-mono text-[#0F172A]">
                  ₹{property.price.toLocaleString('en-IN')}
                </h3>
              </div>

              <div className="bg-accent/5 rounded-2xl p-4 mb-6 border border-accent/20">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Property Status</p>
                <p className="text-base font-bold text-accent capitalize">
                  {property.propertyFor === 'sell' ? 'For Sale' : 'For Rent'}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <Button className="w-full bg-[#0F172A] hover:bg-[#334155] text-white hover:text-white rounded-full font-bold h-11 text-xs uppercase tracking-wider shadow-sm transition-all duration-300">
                  Schedule Tour
                </Button>
                <Button
                  variant="outline"
                  className="w-full border border-border/80 hover:bg-slate-50 rounded-full font-bold h-11 text-xs uppercase tracking-wider text-slate-800 transition-all duration-300 bg-transparent"
                  onClick={() => setShowContactForm(!showContactForm)}
                >
                  Make an Inquiry
                </Button>
              </div>

              {/* Agent/Owner Info */}
              <div className="border-t border-border/80 pt-6">
                <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-wider">Property Owner</h4>
                <div className="bg-slate-50 rounded-2xl p-5 border border-border/80">
                  <p className="font-display font-bold text-slate-900 mb-3 text-base capitalize">{property.ownerName}</p>
                  <div className="space-y-3">
                    <a
                      href={`tel:${property.ownerPhone}`}
                      className="flex items-center gap-2 text-accent hover:text-slate-800 transition font-bold text-xs uppercase tracking-wider"
                    >
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {property.ownerPhone}
                    </a>
                    <a
                      href={`mailto:${property.ownerEmail}`}
                      className="flex items-center gap-2 text-accent hover:text-slate-800 transition font-bold text-xs lowercase break-all"
                    >
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      {property.ownerEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-md mt-6">
                <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-wider">Send Inquiry</h4>
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white resize-none"
                      placeholder="Tell the owner about your interest..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-bold h-10 text-xs uppercase tracking-wider shadow duration-300"
                  >
                    Send Inquiry
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
