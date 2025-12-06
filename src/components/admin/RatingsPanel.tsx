'use client';
import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, Wrench, MessageSquare } from 'lucide-react';

interface Rating {
  _id: string;
  rating: number;
  review: string;
  service: string;
  createdAt: string;
  customer: { name: string; email: string };
  technician: { name: string; specialty: string };
  booking: { service: string; date: string; amount: number };
}

const RatingsPanel: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }
      const response = await fetch('http://localhost:5004/admin/ratings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Ratings data:', data);
        setRatings(data.ratings || []);
      } else {
        console.error('Failed to fetch ratings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = ratings.filter(rating => {
    if (filter === 'all') return true;
    if (filter === 'high') return rating.rating >= 4;
    if (filter === 'low') return rating.rating <= 2;
    return true;
  });

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0';

  const ratingCounts = [1,2,3,4,5].map(star => 
    ratings.filter(r => r.rating === star).length
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-slate-700">Average Rating</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{averageRating}</div>
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(star => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${star <= Math.round(parseFloat(averageRating)) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-slate-700">Total Reviews</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{ratings.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-slate-700">5-Star Reviews</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{ratingCounts[4]}</div>
          <div className="text-sm text-slate-600">
            {ratings.length > 0 ? Math.round((ratingCounts[4] / ratings.length) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-slate-700">Low Ratings</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{ratingCounts[0] + ratingCounts[1]}</div>
          <div className="text-sm text-slate-600">1-2 stars</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {[5,4,3,2,1].map(star => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 w-8">{star}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: ratings.length > 0 ? `${(ratingCounts[star-1] / ratings.length) * 100}%` : '0%' 
                  }}
                />
              </div>
              <span className="text-sm text-slate-700 w-12">{ratingCounts[star-1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Reviews ({ratings.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'high' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            High Ratings (4-5★)
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'low' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Low Ratings (1-2★)
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-slate-900">Customer Reviews</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredRatings.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No reviews found for the selected filter.
            </div>
          ) : (
            filteredRatings.map((rating) => (
              <div key={rating._id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{rating.customer.name}</h4>
                      <p className="text-sm text-slate-600">{rating.customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= rating.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-500">{formatDate(rating.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Wrench className="w-4 h-4 text-slate-500" />
                    <span>{rating.service}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Technician: {rating.technician.name}</span>
                  </div>
                </div>

                {rating.review && rating.review.trim() && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-800 italic leading-relaxed">"{rating.review}"</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingsPanel;