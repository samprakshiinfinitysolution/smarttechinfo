'use client';
import RatingsPanel from '@/components/admin/RatingsPanel';

export default function RatingsPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Ratings & Reviews</h1>
        <p className="text-gray-600 mt-1">Monitor customer feedback and service quality</p>
      </div>
      <RatingsPanel />
    </div>
  );
}