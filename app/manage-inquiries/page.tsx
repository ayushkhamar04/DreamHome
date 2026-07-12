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
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/api';
import ChatOverlay from '@/components/ChatOverlay';

export default function ManageInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeInquiryId, setActiveInquiryId] = useState('');
  const [activeRecipientName, setActiveRecipientName] = useState('');
  const [activeRecipientRole, setActiveRecipientRole] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inquiries/seller');
      
      if (response.data.success) {
        setInquiries(response.data.inquiries);
      }
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      setError(err.response?.data?.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInquiry = async (inquiryId: string) => {
    try {
      setActionLoading(inquiryId);
      const response = await api.put(`/inquiries/${inquiryId}/accept`);
      
      if (response.data.success) {
        setInquiries(inquiries.map((inq: any) => 
          inq._id === inquiryId ? response.data.inquiry : inq
        ));
        alert('Inquiry accepted successfully!');
      }
    } catch (err: any) {
      console.error('Error accepting inquiry:', err);
      alert(err.response?.data?.message || 'Failed to accept inquiry');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineInquiry = async () => {
    if (!selectedInquiryId) return;
    
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      setActionLoading(selectedInquiryId);
      const response = await api.put(`/inquiries/${selectedInquiryId}/decline`, {
        reason: declineReason,
      });
      
      if (response.data.success) {
        setInquiries(inquiries.map((inq: any) => 
          inq._id === selectedInquiryId ? response.data.inquiry : inq
        ));
        setShowDeclineModal(false);
        setDeclineReason('');
        setSelectedInquiryId(null);
        alert('Inquiry declined');
      }
    } catch (err: any) {
      console.error('Error declining inquiry:', err);
      alert(err.response?.data?.message || 'Failed to decline inquiry');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeclineModal = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setShowDeclineModal(true);
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
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading inquiries...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-display text-slate-900 mb-2">Manage Inquiries</h1>
          <p className="text-sm font-semibold text-slate-500">Review and respond to property inquiries from buyers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Total Inquiries</p>
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
          <div className="text-center py-20 bg-card border border-border/80 rounded-3xl shadow-sm">
            <Home className="w-12 h-12 text-slate-350 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-slate-900 mb-2">No Inquiries Yet</h3>
            <p className="text-xs text-slate-500 font-medium">
              You haven't received any property inquiries yet.
            </p>
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

                      <div className="mt-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Property</p>
                        <p className="text-sm font-bold text-slate-900 capitalize">
                          {property?.bhk || 'N/A'} {property?.propertyType || 'Property'}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          <span>{property?.city || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Details */}
                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <h3 className="text-base font-bold font-display text-slate-900 mb-1">Buyer Information</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          <span>Requested on {formatDate(inquiry.createdAt)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-border/80 rounded-2xl p-3.5">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <User className="w-3.5 h-3.5 text-accent" />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Full Name</p>
                          </div>
                          <p className="text-xs font-bold text-slate-800 capitalize truncate">{inquiry.fullName}</p>
                        </div>

                        <div className="bg-slate-50 border border-border/80 rounded-2xl p-3.5">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Mail className="w-3.5 h-3.5 text-accent" />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate">{inquiry.email}</p>
                        </div>

                        <div className="bg-slate-50 border border-border/80 rounded-2xl p-3.5">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Phone className="w-3.5 h-3.5 text-accent" />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate">{inquiry.phone}</p>
                        </div>

                        <div className="bg-slate-50 border border-border/80 rounded-2xl p-3.5">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-accent" />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Profession</p>
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate capitalize">{inquiry.profession}</p>
                        </div>
                      </div>

                      {/* Identity Proof */}
                      <div>
                        <a
                          href={inquiry.identityProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/90 font-bold uppercase tracking-wider"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Identity Proof
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-4">
                      {inquiry.status === 'pending' ? (
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-1.5 mb-2 border-b border-amber-100 pb-1.5">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                                Action Required
                              </h4>
                            </div>
                            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                              Please review this inquiry and take action.
                            </p>
                          </div>

                          <Button
                            onClick={() => handleAcceptInquiry(inquiry._id)}
                            disabled={actionLoading === inquiry._id}
                            className="w-full bg-[#0F172A] hover:bg-[#334155] text-white font-bold rounded-full h-11 text-xs uppercase tracking-wider transition-all shadow-sm"
                          >
                            {actionLoading === inquiry._id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                Accept Inquiry
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => openDeclineModal(inquiry._id)}
                            disabled={actionLoading === inquiry._id}
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full h-11 text-xs uppercase tracking-wider transition-all shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Decline Inquiry
                          </Button>
                        </div>
                      ) : inquiry.status === 'accepted' ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                          <div className="flex items-center gap-1.5 mb-2 border-b border-emerald-100 pb-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                              Inquiry Accepted
                            </h4>
                          </div>
                          <p className="text-xs text-emerald-700 font-semibold leading-relaxed">
                            Your contact details have been shared with the buyer.
                          </p>
                          <button
                            onClick={() => {
                              setActiveInquiryId(inquiry._id);
                              setActiveRecipientName(inquiry.buyer?.name || 'Buyer');
                              setActiveRecipientRole('buyer');
                              setIsChatOpen(true);
                            }}
                            className="mt-4 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0F172A] hover:bg-[#334155] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-sm transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-accent" />
                            <span>Chat with Buyer</span>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                          <div className="flex items-center gap-1.5 mb-2 border-b border-rose-100 pb-1.5">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <h4 className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">
                              Inquiry Declined
                            </h4>
                          </div>
                          {inquiry.declineReason && (
                            <p className="text-xs text-rose-700 font-semibold leading-relaxed mt-2">
                              Reason: {inquiry.declineReason}
                            </p>
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
      </main>

      <Footer />

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl p-8">
            <h3 className="text-lg font-bold font-display text-slate-900 mb-2">Decline Inquiry</h3>
            <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
              Please provide a reason for declining this inquiry. This will be shared with the buyer.
            </p>
            
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-border/80 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-xs font-semibold resize-none"
              rows={4}
              placeholder="Enter decline reason..."
            />

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                  setSelectedInquiryId(null);
                }}
                variant="outline"
                className="flex-1 border border-border/80 hover:bg-slate-50 text-slate-800 rounded-full font-bold h-10 text-xs uppercase tracking-wider px-6"
                disabled={actionLoading !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeclineInquiry}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold h-10 text-xs uppercase tracking-wider px-6"
                disabled={actionLoading !== null || !declineReason.trim()}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Declining...
                  </>
                ) : (
                  'Decline'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        inquiryId={activeInquiryId}
        recipientName={activeRecipientName}
        recipientRole={activeRecipientRole}
      />
    </div>
  );
}