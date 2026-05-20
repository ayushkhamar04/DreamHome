import PropertyForm from '../components/PropertyForm';
import Header from '@/components/Header'
export default function SubmitPropertyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      <Header />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Submit Your Property
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill in the details below to list your property for approval
          </p>
          <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-[#b04439] to-[#8d362e] mx-auto rounded-full"></div>
        </div>
        <div className="bg-white shadow-2xl rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-100">
          <PropertyForm />
        </div>
      </div>
    </div>
  );
}