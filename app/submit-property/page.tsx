'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';

const PropertyForm = dynamic(() => import('../components/PropertyForm'), { ssr: false });

export default function SubmitPropertyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <Header />
      <div className="max-w-4xl mx-auto pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-2">
            Submit Your Property
          </h1>
          <p className="text-xs font-semibold text-slate-500 max-w-2xl mx-auto">
            Fill in the details below to list your property for approval
          </p>
          <div className="mt-3 h-0.5 w-12 bg-accent mx-auto rounded-full"></div>
        </div>
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
          <PropertyForm />
        </div>
      </div>
    </div>
  );
}