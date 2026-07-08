'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { 
  Loader2, AlertCircle, CheckCircle, Clock, XCircle, 
  Search, Filter, Eye, Download, FileCheck, MapPin,
  Home, User, Mail, Phone, Calendar, DollarSign, Maximize2,
  Users, ShoppingCart, Store, MessageSquare, LogOut, BarChart3,
  TrendingUp, Activity, Briefcase, FileText, Shield
} from 'lucide-react';
import { Lock } from 'lucide-react';

interface Property {
  _id: string;
  propertyType: string;
  bhk: string;
  sqft: number;
  city: string;
  address: string;
  facilities: string[];
  propertyFor: string;
  price: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  propertyImages: string[];
  propertyProof: string;
  charges: number;
  paymentMethod: string;
  paymentDetails?: any;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: string;
}

interface Inquiry {
  _id: string;
  property: {
    _id: string;
    propertyType: string;
    bhk: string;
    city: string;
    price: number;
    propertyImages: string[];
  };
  buyer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  fullName: string;
  email: string;
  phone: string;
  profession: string;
  identityProof: string;
  status: 'pending' | 'accepted' | 'declined';
  declineReason?: string;
  sellerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalAdmins: number;
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
  rejectedProperties: number;
  totalInquiries: number;
  pendingInquiries: number;
  acceptedInquiries: number;
  declinedInquiries: number;
}

type ViewMode = 'properties' | 'buyers' | 'sellers' | 'inquiries';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [buyers, setBuyers] = useState<UserData[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<UserData[]>([]);
  const [sellers, setSellers] = useState<UserData[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<UserData[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('properties');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      const response = await api.get('/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await api.post('/admin/login', {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        setLoginError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
      setProperties([]);
      setBuyers([]);
      setSellers([]);
      setInquiries([]);
      setStats(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const [propertiesRes, statsRes, usersRes, inquiriesRes] = await Promise.all([
        api.get('/admin/properties', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/admin/statistics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/admin/inquiries', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (propertiesRes.data.success) {
        setProperties(propertiesRes.data.properties);
        setFilteredProperties(propertiesRes.data.properties);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (usersRes.data.success) {
        const allUsers = usersRes.data.users;
        const buyersList = allUsers.filter((u: UserData) => u.role === 'buyer');
        const sellersList = allUsers.filter((u: UserData) => u.role === 'seller');
        setBuyers(buyersList);
        setFilteredBuyers(buyersList);
        setSellers(sellersList);
        setFilteredSellers(sellersList);
      }

      if (inquiriesRes.data.success) {
        setInquiries(inquiriesRes.data.inquiries);
        setFilteredInquiries(inquiriesRes.data.inquiries);
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters for properties
  useEffect(() => {
    let filtered = properties;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.ownerName.toLowerCase().includes(query) ||
        p.ownerEmail.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.propertyType.toLowerCase().includes(query) ||
        p.bhk.toLowerCase().includes(query)
      );
    }

    setFilteredProperties(filtered);
  }, [statusFilter, searchQuery, properties]);

  // Apply filters for buyers
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = buyers.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        b.phone.includes(query)
      );
      setFilteredBuyers(filtered);
    } else {
      setFilteredBuyers(buyers);
    }
  }, [searchQuery, buyers]);

  // Apply filters for sellers
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = sellers.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.includes(query)
      );
      setFilteredSellers(filtered);
    } else {
      setFilteredSellers(sellers);
    }
  }, [searchQuery, sellers]);

  // Apply filters for inquiries
  useEffect(() => {
    let filtered = inquiries;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.fullName.toLowerCase().includes(query) ||
        i.email.toLowerCase().includes(query) ||
        i.buyer.name.toLowerCase().includes(query) ||
        i.seller.name.toLowerCase().includes(query) ||
        i.property.city.toLowerCase().includes(query)
      );
    }

    setFilteredInquiries(filtered);
  }, [statusFilter, searchQuery, inquiries]);

  // Reset filters when changing view mode
  useEffect(() => {
    setStatusFilter('all');
    setSearchQuery('');
  }, [viewMode]);

  const handleApprove = async (property: Property) => {
    if (!window.confirm(`Approve property for ${property.ownerName}?`)) return;

    setProcessingId(property._id);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/admin/properties/${property._id}`, 
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await loadDashboardData();
        setIsModalOpen(false);
        alert('Property approved successfully!');
      }
    } catch (err: any) {
      console.error('Error approving property:', err);
      alert(err.response?.data?.message || 'Failed to approve property');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (property: Property) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason || !reason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    setProcessingId(property._id);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/admin/properties/${property._id}`,
        { status: 'rejected', rejectionReason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await loadDashboardData();
        setIsModalOpen(false);
        alert('Property rejected successfully');
      }
    } catch (err: any) {
      console.error('Error rejecting property:', err);
      alert(err.response?.data?.message || 'Failed to reject property');
    } finally {
      setProcessingId(null);
    }
  };

  const openPropertyModal = (property: Property) => {
    setSelectedProperty(property);
    setSelectedUser(null);
    setSelectedInquiry(null);
    setIsModalOpen(true);
  };

  const openUserModal = (user: UserData) => {
    setSelectedUser(user);
    setSelectedProperty(null);
    setSelectedInquiry(null);
    setIsModalOpen(true);
  };

  const openInquiryModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setSelectedProperty(null);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {status === 'approved' ? 'Approved' : 'Accepted'}
          </span>
        );
      case 'rejected':
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            {status === 'rejected' ? 'Rejected' : 'Declined'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  // Loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-[2rem] shadow-xl p-8 border border-border/80">
            
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">
                Admin Portal
              </h1>
              <p className="text-xs font-semibold text-slate-400">
                Sign in to manage the DreamHome platform
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs font-bold">{loginError}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-xs font-semibold"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-xs font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 bg-[#0F172A] hover:bg-[#334155] text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const propertyStats = {
    total: properties.length,
    pending: properties.filter(p => p.status === 'pending').length,
    approved: properties.filter(p => p.status === 'approved').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header with Logout */}
        <div className="mb-10 flex items-center justify-between pb-6 border-b border-border/85">
          <div>
            <h1 className="text-3xl font-bold font-display text-slate-900 mb-1.5">
              Admin Portal
            </h1>
            <p className="text-sm font-semibold text-slate-450">Comprehensive platform analytics & controls</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* Overall Statistics */}
        {stats && (
          <div className="space-y-8 mb-10">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 mb-4">Platform Overview</h2>
              
              {/* User Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#0F172A]">{stats.totalUsers}</div>
                </div>

                <div 
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:border-accent/40 transition-all duration-300 cursor-pointer"
                  onClick={() => setViewMode('buyers')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buyers</span>
                    <ShoppingCart className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#0F172A]">{stats.totalBuyers}</div>
                  <p className="text-[9px] font-bold text-accent uppercase tracking-wider mt-2.5">Click to view all</p>
                </div>

                <div 
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:border-accent/40 transition-all duration-300 cursor-pointer"
                  onClick={() => setViewMode('sellers')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sellers</span>
                    <Store className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#0F172A]">{stats.totalSellers}</div>
                  <p className="text-[9px] font-bold text-accent uppercase tracking-wider mt-2.5">Click to view all</p>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admins</span>
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#0F172A]">{stats.totalAdmins}</div>
                </div>
              </div>
            </div>

            {/* Inquiry Stats */}
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900 mb-4">Inquiries Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div 
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:border-accent/40 transition-all duration-300 cursor-pointer"
                  onClick={() => setViewMode('inquiries')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inquiries</span>
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#0F172A]">{stats.totalInquiries}</div>
                  <p className="text-[9px] font-bold text-accent uppercase tracking-wider mt-2.5">Click to view all</p>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</span>
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#0F172A]">{stats.pendingInquiries}</div>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accepted</span>
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#0F172A]">{stats.acceptedInquiries}</div>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Declined</span>
                    <XCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#0F172A]">{stats.declinedInquiries}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="mb-8 flex gap-3 flex-wrap">
          <button
            onClick={() => setViewMode('properties')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewMode === 'properties'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-card border border-border/80 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-accent" />
            Properties ({properties.length})
          </button>
          
          <button
            onClick={() => setViewMode('buyers')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewMode === 'buyers'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-card border border-border/80 text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-accent" />
            Buyers ({buyers.length})
          </button>
          
          <button
            onClick={() => setViewMode('sellers')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewMode === 'sellers'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-card border border-border/80 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-accent" />
            Sellers ({sellers.length})
          </button>
          
          <button
            onClick={() => setViewMode('inquiries')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewMode === 'inquiries'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-card border border-border/80 text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent" />
            Inquiries ({inquiries.length})
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 rounded-3xl bg-card border border-border/80 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  viewMode === 'properties' ? "Search by owner, email, city, or property type..." :
                  viewMode === 'buyers' || viewMode === 'sellers' ? "Search by name, email, or phone..." :
                  "Search by name, email, buyer, seller, or city..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white text-xs font-semibold"
              />
            </div>

            {/* Status Filter (for properties and inquiries) */}
            {(viewMode === 'properties' || viewMode === 'inquiries') && (
              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-slate-800 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-accent/50 cursor-pointer min-w-[160px] appearance-none"
                >
                  <option value="all">All Status</option>
                  {viewMode === 'properties' ? (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            Showing <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {viewMode === 'properties' ? filteredProperties.length :
               viewMode === 'buyers' ? filteredBuyers.length :
               viewMode === 'sellers' ? filteredSellers.length :
               filteredInquiries.length}
            </span> of {
              viewMode === 'properties' ? properties.length :
              viewMode === 'buyers' ? buyers.length :
              viewMode === 'sellers' ? sellers.length :
              inquiries.length
            } {viewMode}
          </div>
        </div>

        {/* Properties View */}
        {viewMode === 'properties' && (
          filteredProperties.length > 0 ? (
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div
                  key={property._id}
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Property Image */}
                    <div className="w-full lg:w-48 h-48 rounded-2xl overflow-hidden bg-slate-150 flex-shrink-0">
                      {property.propertyImages && property.propertyImages.length > 0 ? (
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
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 space-y-4">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold font-display text-slate-900 capitalize mb-1">
                            {property.bhk} {property.propertyType}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            <span>{property.city}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold font-mono text-accent">
                            ₹{property.price.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">For {property.propertyFor}</div>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-border/80">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Owner</div>
                          <div className="text-xs font-bold text-slate-800 capitalize mt-0.5">{property.ownerName}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Area</div>
                          <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">{property.sqft} sqft</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Charges</div>
                          <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">₹{property.charges}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Submitted</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(property.status)}
                          {property.status === 'rejected' && property.rejectionReason && (
                            <span className="text-xs text-rose-600 font-medium italic">
                              "{property.rejectionReason}"
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPropertyModal(property)}
                            className="px-4 py-2 rounded-full border border-border/80 hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>

                          {property.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(property)}
                                disabled={processingId === property._id}
                                className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              >
                                {processingId === property._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>

                              <button
                                onClick={() => handleReject(property)}
                                disabled={processingId === property._id}
                                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              >
                                {processingId === property._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-card border border-dashed border-border/80 shadow-sm">
              <AlertCircle className="w-12 h-12 text-slate-400/40 mx-auto mb-4" />
              <p className="font-display font-bold text-slate-900 text-base mb-1">No properties found</p>
              <p className="text-xs text-slate-500 font-medium">
                Try adjusting your filters or search query
              </p>
            </div>
          )
        )}

        {/* Buyers View */}
        {viewMode === 'buyers' && (
          filteredBuyers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuyers.map((buyer) => (
                <div
                  key={buyer._id}
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 mb-1 capitalize">
                        {buyer.name}
                      </h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent font-bold uppercase tracking-wider">
                        Buyer
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{buyer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{buyer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Joined {new Date(buyer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openUserModal(buyer)}
                    className="w-full mt-4 px-4 py-2.5 rounded-full border border-border/80 hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-card border border-dashed border-border/80 shadow-sm">
              <AlertCircle className="w-12 h-12 text-slate-400/40 mx-auto mb-4" />
              <p className="font-display font-bold text-slate-900 text-base mb-1">No buyers found</p>
              <p className="text-xs text-slate-500 font-medium">Try adjusting your search query</p>
            </div>
          )
        )}

        {/* Sellers View */}
        {viewMode === 'sellers' && (
          filteredSellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSellers.map((seller) => (
                <div
                  key={seller._id}
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 mb-1 capitalize">
                        {seller.name}
                      </h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent font-bold uppercase tracking-wider">
                        Seller
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{seller.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{seller.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Joined {new Date(seller.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openUserModal(seller)}
                    className="w-full mt-4 px-4 py-2.5 rounded-full border border-border/80 hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-card border border-dashed border-border/80 shadow-sm">
              <AlertCircle className="w-12 h-12 text-slate-400/40 mx-auto mb-4" />
              <p className="font-display font-bold text-slate-900 text-base mb-1">No sellers found</p>
              <p className="text-xs text-slate-500 font-medium">Try adjusting your search query</p>
            </div>
          )
        )}

        {/* Inquiries View */}
        {viewMode === 'inquiries' && (
          filteredInquiries.length > 0 ? (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Property Thumbnail */}
                    <div className="w-full lg:w-32 h-32 rounded-2xl overflow-hidden bg-slate-150 flex-shrink-0">
                      {inquiry.property.propertyImages && inquiry.property.propertyImages.length > 0 ? (
                        <img
                          src={inquiry.property.propertyImages[0]}
                          alt={inquiry.property.propertyType}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-slate-350" />
                        </div>
                      )}
                    </div>

                    {/* Inquiry Details */}
                    <div className="flex-1 space-y-4">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold font-display text-slate-900 mb-1 capitalize">
                            {inquiry.fullName}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500">
                            Inquiring about {inquiry.property.bhk} {inquiry.property.propertyType} in {inquiry.property.city}
                          </p>
                        </div>
                        {getStatusBadge(inquiry.status)}
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-border/80">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Buyer</div>
                          <div className="text-xs font-bold text-slate-800 capitalize">{inquiry.buyer.name}</div>
                          <div className="text-[10px] text-slate-450 mt-0.5">{inquiry.buyer.email}</div>
                        </div>
                        
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-border/80">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seller</div>
                          <div className="text-xs font-bold text-slate-800 capitalize">{inquiry.seller.name}</div>
                          <div className="text-[10px] text-slate-450 mt-0.5">{inquiry.seller.email}</div>
                        </div>
                        
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-border/80 flex flex-col justify-center">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Profession</div>
                          <div className="text-xs font-bold text-slate-850 capitalize">{inquiry.profession}</div>
                        </div>
                      </div>

                      {/* Contact & Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inquiry.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => openInquiryModal(inquiry)}
                          className="px-4 py-2 rounded-full border border-border/80 hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-card border border-dashed border-border/80 shadow-sm">
              <AlertCircle className="w-12 h-12 text-slate-400/40 mx-auto mb-4" />
              <p className="font-display font-bold text-slate-900 text-base mb-1">No inquiries found</p>
              <p className="text-xs text-slate-500 font-medium">Try adjusting your filters or search query</p>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {isModalOpen && selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setIsModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processingId === selectedProperty._id}
        />
      )}

      {isModalOpen && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isModalOpen && selectedInquiry && (
        <InquiryDetailsModal
          inquiry={selectedInquiry}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// Property Details Modal
function PropertyDetailsModal({ 
  property, 
  onClose, 
  onApprove, 
  onReject,
  processing 
}: { 
  property: Property; 
  onClose: () => void;
  onApprove: (property: Property) => void;
  onReject: (property: Property) => void;
  processing: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = property.propertyImages || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Property Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <XCircle className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="relative h-80 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={images[currentImageIndex]}
                  alt={`Property image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-emerald-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Property Type</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">{property.propertyType}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">BHK</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{property.bhk}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Area</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{property.sqft} sq.ft</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Price</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">₹{property.price.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">City</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{property.city}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Listing Type</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">{property.propertyFor}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Full Address</div>
            <div className="text-neutral-900 dark:text-neutral-100">{property.address}</div>
          </div>

          {property.facilities && property.facilities.length > 0 && (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">Amenities</div>
              <div className="flex flex-wrap gap-2">
                {property.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
            <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-3">Owner Information</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{property.ownerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{property.ownerEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{property.ownerPhone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Charges</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">₹{property.charges}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Payment Method</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase">{property.paymentMethod}</div>
            </div>
          </div>

          {/* Payment Details Section */}
          {property.paymentDetails && Object.keys(property.paymentDetails).length > 0 && (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-2 border border-neutral-100 dark:border-neutral-700/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Payment Verification Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {property.paymentDetails.txnId && (
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">Transaction ID:</span>{' '}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{property.paymentDetails.txnId}</span>
                  </div>
                )}
                {property.paymentMethod === 'upi' && property.paymentDetails.upiId && (
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">UPI ID:</span>{' '}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{property.paymentDetails.upiId}</span>
                  </div>
                )}
                {property.paymentMethod === 'card' && (
                  <>
                    {property.paymentDetails.cardHolderName && (
                      <div className="sm:col-span-2">
                        <span className="text-neutral-500 dark:text-neutral-400">Cardholder:</span>{' '}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{property.paymentDetails.cardHolderName}</span>
                      </div>
                    )}
                    {property.paymentDetails.cardNumber && (
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Card Number:</span>{' '}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {property.paymentDetails.cardNumber.replace(/\d(?=\d{4})/g, '*')}
                        </span>
                      </div>
                    )}
                    {property.paymentDetails.cardExpiry && (
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Expiry:</span>{' '}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{property.paymentDetails.cardExpiry}</span>
                      </div>
                    )}
                  </>
                )}
                {property.paymentMethod === 'netbanking' && (
                  <>
                    {property.paymentDetails.bankName && (
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Bank Name:</span>{' '}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{property.paymentDetails.bankName}</span>
                      </div>
                    )}
                    {property.paymentDetails.accountNumber && (
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Account No:</span>{' '}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {property.paymentDetails.accountNumber.replace(/\d(?=\d{4})/g, '*')}
                        </span>
                      </div>
                    )}
                    {property.paymentDetails.ifscCode && (
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400">IFSC Code:</span>{' '}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase">{property.paymentDetails.ifscCode}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {property.propertyProof && (
              <a
                href={property.propertyProof}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 dark:bg-neutral-700 text-white font-medium hover:bg-neutral-900 dark:hover:bg-neutral-600 transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                View Property Proof
              </a>
            )}
            {property.receiptUrl && (
              <a
                href={property.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </a>
            )}
          </div>

          {property.status === 'rejected' && property.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30">
              <div className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-2">Rejection Reason</div>
              <div className="text-sm text-rose-700 dark:text-rose-300">{property.rejectionReason}</div>
            </div>
          )}

          {property.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => onApprove(property)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Approve Property
              </button>
              <button
                onClick={() => onReject(property)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                Reject Property
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// User Details Modal
function UserDetailsModal({ 
  user, 
  onClose 
}: { 
  user: UserData; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full">
        
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">User Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <XCircle className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              user.role === 'buyer' 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-500'
            }`}>
              {user.role === 'buyer' ? (
                <ShoppingCart className="w-10 h-10 text-white" />
              ) : (
                <Store className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{user.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                user.role === 'buyer'
                  ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">User ID</div>
              <div className="font-mono text-sm text-neutral-900 dark:text-neutral-100">{user._id}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Email</div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-900 dark:text-neutral-100">{user.email}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Phone</div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-900 dark:text-neutral-100">{user.phone}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Registration Date</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-900 dark:text-neutral-100">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inquiry Details Modal
function InquiryDetailsModal({ 
  inquiry, 
  onClose 
}: { 
  inquiry: Inquiry; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Inquiry Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <XCircle className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                Inquiry from {inquiry.fullName}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Submitted on {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {inquiry.status === 'accepted' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Accepted
                </span>
              )}
              {inquiry.status === 'declined' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" />
                  Declined
                </span>
              )}
              {inquiry.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </span>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
            <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-3">Property Details</div>
            <div className="flex gap-4">
              {inquiry.property.propertyImages && inquiry.property.propertyImages.length > 0 && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                  <img
                    src={inquiry.property.propertyImages[0]}
                    alt={inquiry.property.propertyType}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {inquiry.property.bhk} {inquiry.property.propertyType}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {inquiry.property.city}
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{inquiry.property.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30">
            <div className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">Buyer Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-green-700 dark:text-green-400 mb-1">Name</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.buyer.name}</div>
              </div>
              <div>
                <div className="text-xs text-green-700 dark:text-green-400 mb-1">User ID</div>
                <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">{inquiry.buyer._id}</div>
              </div>
              <div>
                <div className="text-xs text-green-700 dark:text-green-400 mb-1">Email</div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{inquiry.buyer.email}</div>
              </div>
              <div>
                <div className="text-xs text-green-700 dark:text-green-400 mb-1">Phone</div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{inquiry.buyer.phone}</div>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
            <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-3">Seller Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Name</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.seller.name}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">User ID</div>
                <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">{inquiry.seller._id}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Email</div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{inquiry.seller.email}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Phone</div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{inquiry.seller.phone}</div>
              </div>
            </div>
          </div>

          {/* Inquiry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Contact Email</div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.email}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Contact Phone</div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.phone}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Profession</div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.profession}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Inquiry ID</div>
              <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">{inquiry._id}</div>
            </div>
          </div>

          {/* Identity Proof */}
          {inquiry.identityProof && (
            <a
              href={inquiry.identityProof}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 dark:bg-neutral-700 text-white font-medium hover:bg-neutral-900 dark:hover:bg-neutral-600 transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              View Identity Proof
            </a>
          )}

          {/* Decline Reason */}
          {inquiry.status === 'declined' && inquiry.declineReason && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30">
              <div className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-2">Decline Reason</div>
              <div className="text-sm text-rose-700 dark:text-rose-300">{inquiry.declineReason}</div>
            </div>
          )}

          {/* Seller Contact (if accepted) */}
          {inquiry.status === 'accepted' && inquiry.sellerPhone && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
              <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Seller Contact Shared</div>
              <div className="text-sm text-emerald-700 dark:text-emerald-300">
                Seller's phone: {inquiry.sellerPhone}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}