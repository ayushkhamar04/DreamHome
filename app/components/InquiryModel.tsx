'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2, User, Mail, Phone, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/api';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

export default function InquiryModal({ isOpen, onClose, propertyId, propertyTitle }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profession: '',
  });
  const [identityProof, setIdentityProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch user data and prefill form
  useEffect(() => {
    if (isOpen) {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setFormData({
          fullName: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          profession: '',
        });
      }
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          profession: '',
        });
        setIdentityProof(null);
        setPreviewUrl('');
        setIsSuccess(false);
        setError('');
      }, 300);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }

      setIdentityProof(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  // Validation
  if (!formData.fullName || !formData.email || !formData.phone || !formData.profession) {
    setError('Please fill in all required fields');
    return;
  }

  if (!identityProof) {
    setError('Please upload your identity proof');
    return;
  }

  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('propertyId', propertyId);
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('profession', formData.profession);
    formDataToSend.append('identityProof', identityProof);

    // REMOVE the headers configuration - let the api instance handle it
    const response = await api.post('/inquiries', formDataToSend);

    if (response.data.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  } catch (err: any) {
    console.error('Inquiry submission error:', err);
    setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>

        {/* Success State */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Inquiry Submitted!
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-md">
              Your inquiry has been sent to the property owner. You can track the status in your Requested Properties page.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                Property Inquiry
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {propertyTitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                  <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Profession <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g., Software Engineer, Teacher, Doctor"
                    required
                  />
                </div>
              </div>

              {/* Identity Proof Upload */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Identity Proof <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="identity-proof-upload"
                    required
                  />
                  <label
                    htmlFor="identity-proof-upload"
                    className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-800/50 cursor-pointer transition-all group"
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full p-4">
                        <img
                          src={previewUrl}
                          alt="Identity proof preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 text-neutral-400 group-hover:text-emerald-500 transition-colors mb-2" />
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-emerald-500">
                          Click to upload identity proof
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          (Aadhaar, PAN, Passport, Driving License)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {identityProof && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                    Selected: {identityProof.name}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Inquiry'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}