'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Loader2, 
  Home, 
  MapPin, 
  Calendar, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  ChevronRight,
  User,
  Mail,
  Briefcase,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/api';

export default function RequestedPropertiesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inquiries/buyer');
      
      if (response.data.success) {
        setInquiries(response.data.inquiries);
      }
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      setError(err.response?.data?.message || 'Failed to load requested properties');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          color: 'bg-emerald-50 text-emerald-700 border border-emerald-100/50',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: 'Accepted',
        };
      case 'declined':
        return {
          color: 'bg-rose-50 text-rose-700 border border-rose-100/50',
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: 'Declined',
        };
      case 'pending':
        return {
          color: 'bg-amber-50 text-amber-700 border border-amber-100/50',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Pending',
        };
      default:
        return {
          color: 'bg-slate-50 text-slate-700 border border-slate-100',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: status,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: any) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading your requests...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-display text-slate-900 mb-2">Requested Properties</h1>
          <p className="text-sm font-semibold text-slate-500">Track your property inquiries and their status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Total Requests</p>
                <p className="text-2xl font-bold font-mono text-slate-900">{inquiries.length}</p>
              </div>
              <Home className="w-5 h-5 text-accent" />
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Pending</p>
                <p className="text-2xl font-bold font-mono text-amber-600">
                  {inquiries.filter((inq: any) => inq.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Accepted</p>
                <p className="text-2xl font-bold font-mono text-emerald-600">
                  {inquiries.filter((inq: any) => inq.status === 'accepted').length}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Declined</p>
                <p className="text-2xl font-bold font-mono text-rose-600">
                  {inquiries.filter((inq: any) => inq.status === 'declined').length}
                </p>
              </div>
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-6">
            <p className="text-xs font-bold text-rose-750">{error}</p>
          </div>
        )}

        {/* Inquiries List */}
        {inquiries.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border/80 rounded-3xl">
            <Home className="w-12 h-12 text-slate-350 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-slate-900 mb-2">No Requests Yet</h3>
            <p className="text-xs text-slate-500 font-medium mb-6">
              You haven't made any property inquiries yet.
            </p>
            <Button onClick={() => router.push('/')} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all">
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {inquiries.map((inquiry: any) => {
              const statusConfig = getStatusConfig(inquiry.status);
              const property = inquiry.property;

              return (
                <div
                  key={inquiry._id}
                  className="bg-card border border-border/80 rounded-3xl overflow-hidden hover:shadow transition-shadow duration-300"
                >
                  <div className="grid md:grid-cols-12 gap-6 p-6">
                    {/* Property Image */}
                    <div className="md:col-span-3">
                      <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-150">
                        {property?.propertyImages?.[0] ? (
                          <img
                            src={property.propertyImages[0]}
                            alt={property.propertyType}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-10 h-10 text-slate-300" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="md:col-span-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold font-display text-slate-900 mb-1.5 capitalize">
                          {property?.bhk || 'N/A'} {property?.propertyType || 'Property'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          <span>{property?.city || 'Unknown'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6 bg-slate-50 p-4 rounded-2xl border border-border/85">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Price</p>
                          <p className="text-base font-bold font-mono text-accent">
                            {formatPrice(property?.price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Requested On</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(inquiry.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Decline Reason */}
                      {inquiry.status === 'declined' && inquiry.declineReason && (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1">
                                Reason for Decline
                              </p>
                              <p className="text-xs text-rose-700 font-semibold leading-relaxed">
                                {inquiry.declineReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Seller Contact (Only for Accepted) */}
                    <div className="md:col-span-3">
                      {inquiry.status === 'accepted' ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                          <div className="flex items-center gap-1.5 mb-4 border-b border-emerald-100 pb-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                              Contact Seller
                            </h4>
                          </div>
                          
                          <div className="space-y-3.5">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Seller Name</p>
                              <p className="text-xs font-bold text-slate-850 capitalize">
                                {inquiry.seller?.name || 'N/A'}
                              </p>
                            </div>
                            
                            {inquiry.sellerPhone && (
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                  <a 
                                    href={`tel:${inquiry.sellerPhone}`}
                                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 tracking-wider hover:underline"
                                  >
                                    {inquiry.sellerPhone}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : inquiry.status === 'pending' ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                          <div className="flex items-center gap-1.5 mb-2 border-b border-amber-100 pb-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                              Awaiting Response
                            </h4>
                          </div>
                          <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                            The seller will review your request shortly.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}