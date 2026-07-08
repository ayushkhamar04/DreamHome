'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Home,
  MapPin,
  Clock,
  Receipt,
  Sparkles,
  FileCheck
} from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPropertyId, setUpdatingPropertyId] = useState<string | null>(null);
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-md">
            <AlertCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-md">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await api.get('/properties/owner', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProperties(response.data.properties || []);
      } else {
        setError('Failed to fetch properties');
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      if (err.response?.status === 401) {
        router.push('/auth/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load properties');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleMarkAsSold = async (propertyId: string) => {
    try {
      setUpdatingPropertyId(propertyId);
      const token = localStorage.getItem('token');

      const response = await api.patch(
        `/properties/${propertyId}/mark-sold`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProperties(prev =>
          prev.map(prop =>
            prop._id === propertyId
              ? { ...prop, sold: true, soldDate: new Date() }
              : prop
          )
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark property as sold');
    } finally {
      setUpdatingPropertyId(null);
    }
  };

  const handleMarkAsAvailable = async (propertyId: string) => {
    try {
      setUpdatingPropertyId(propertyId);
      const token = localStorage.getItem('token');

      const response = await api.patch(
        `/properties/${propertyId}/mark-available`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProperties(prev =>
          prev.map(prop =>
            prop._id === propertyId
              ? { ...prop, sold: false, soldDate: null }
              : prop
          )
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark property as available');
    } finally {
      setUpdatingPropertyId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading your properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2.5 p-5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-16">

        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight mb-2">
            My Properties
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Manage and track your property listings professionally
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-border/80 bg-card shadow-sm">
            <Home className="w-12 h-12 mx-auto text-accent mb-6" />
            <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
              No Properties Yet
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-8">
              Start listing your properties to manage them here.
            </p>

            <Button
              onClick={() => router.push('/submit-property')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-3 h-10 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Submit Your First Property
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {properties.map((property: any) => {
              const receiptUrl = property.receiptUrl || property.paymentReceipt || property.receipt || null;
              return (
                <div
                  key={property._id}
                  className="bg-card rounded-3xl border border-border/80 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                  {/* Property Image */}
                  <div className="w-full lg:w-48 h-40 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    {property.propertyImages && property.propertyImages.length > 0 ? (
                      <img
                        src={property.propertyImages[0]}
                        alt={property.propertyType || 'Property'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Status badge overlaid on image */}
                    {property.status && (
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(property.status)}
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold font-display text-slate-900 capitalize mb-1">
                            {property.bhk ? (property.bhk.toUpperCase().includes('BHK') ? property.bhk : `${property.bhk} BHK`) : 'N/A'} {property.propertyType || 'Property'}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            <span>{property.city || 'Mumbai'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold font-mono text-accent">
                            ₹{property.price?.toLocaleString('en-IN') || '0'}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            For {property.propertyFor === 'sell' ? 'Buy' : 'Rent'}
                          </div>
                        </div>
                      </div>

                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-border/80 mt-4">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Area</div>
                          <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">{property.sqft || 'N/A'} sqft</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Listing Charges</div>
                          <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">₹{property.charges || '0'}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Listed Date</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Name</div>
                          <div className="text-xs font-bold text-slate-850 truncate mt-0.5" title={property.propertyName}>
                            {property.propertyName || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents Row */}
                    {(receiptUrl || property.propertyProof || (property.status === 'approved' && !receiptUrl)) && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                        {receiptUrl && (
                          <a
                            href={receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all shadow-sm"
                          >
                            <Receipt className="w-3.5 h-3.5" />
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/25 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generate Receipt</span>
                          </button>
                        )}

                        {property.propertyProof && (
                          <a
                            href={property.propertyProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-border/80 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all shadow-sm"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Property Proof</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Action buttons footer */}
                    {property.status === 'approved' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                        {/* Availability Status */}
                        {property.sold ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Sold on {new Date(property.soldDate).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                            <span>
                              Available for {property.propertyFor === 'sell' ? 'Buy' : 'Rent'}
                            </span>
                          </div>
                        )}

                        {/* Toggle State Action Button */}
                        {property.sold ? (
                          <Button
                            onClick={() => handleMarkAsAvailable(property._id)}
                            disabled={updatingPropertyId === property._id}
                            variant="outline"
                            className="border border-border/80 hover:bg-slate-50 text-slate-800 rounded-full font-bold h-9 px-4 text-xs uppercase tracking-wider transition-all"
                          >
                            {updatingPropertyId === property._id ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Mark as Available
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleMarkAsSold(property._id)}
                            disabled={updatingPropertyId === property._id}
                            className="bg-[#0F172A] hover:bg-[#334155] text-white rounded-full font-bold h-9 px-4 text-xs uppercase tracking-wider transition-all"
                          >
                            {updatingPropertyId === property._id ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Mark as Sold
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
