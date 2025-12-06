"use client";
import { useState, useEffect } from "react";
  
import Link from "next/link";

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/services/active`);
      const data = await res.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <section className="w-full text-black pt-8 pb-16 bg-white">
        <div className="text-center mb-10">
          <div className="w-48 h-10 bg-gray-200 rounded mx-auto mb-3 animate-pulse"></div>
          <div className="w-96 h-6 bg-gray-100 rounded mx-auto animate-pulse"></div>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-pulse">
              <div className="w-16 h-5 bg-gray-200 rounded-full mb-3"></div>
              <div className="w-full h-36 bg-gray-200 rounded-lg mb-3"></div>
              <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-100 rounded mb-3"></div>
              <div className="w-full h-16 bg-gray-100 rounded-lg mb-3"></div>
              <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="w-full text-black pt-8 pb-16 bg-white">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold">Our Services</h2>
        <p className="text-lg text-gray-600 mt-2">
          Professional repair services for all major appliances
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Services Available</h3>
          <p className="text-gray-500">Please check back later for our services.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
          {services.map((item: any, index: number) => (
          <div
            key={item._id ?? item.id ?? index}
            className="
              relative bg-white rounded-xl border border-gray-200 
              shadow-sm p-4 transition-all duration-300 
              hover:shadow-xl hover:scale-[1.02] hover:border-gray-300
              flex flex-col
            "
          >
            {/* Top Badge */}
            <div className="absolute top-2 left-2 bg-[#0C1B33] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md z-10">
              Expert
            </div>

            {/* Tool Icon */}
            <div className="absolute top-2 right-2 text-gray-600 text-lg z-10">
              🛠️
            </div>

            {/* Image */}
            <div className="overflow-hidden rounded-lg mt-7 mb-3 flex items-center justify-center bg-gray-50">
              <img
                src={item.image ? (item.image.startsWith('http') ? item.image : `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/,'')}${item.image}`) : '/placeholder.jpg'}
                alt={item.name || item.title}
                className="w-full h-36 object-contain transition-all duration-300 hover:scale-110"
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                {item.name || item.title}
              </h4>
              <p className="text-gray-500 text-xs mb-2.5 line-clamp-1">
                {item.category || item.subtitle}
              </p>
              
              {/* Service Charge */}
              { (item.serviceCharges || item.price) && (
                <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3 flex items-baseline justify-between gap-2">
                  <span className="text-xs text-gray-600 whitespace-nowrap">Service Charge:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{item.serviceCharges ?? item.price}
                  </span>
                </div>
              )}

              {/* Book Now Button */}
              <Link href={`/book?service=${encodeURIComponent(item.name || item.title)}&price=${encodeURIComponent(item.serviceCharges ?? item.price ?? '')}&serviceId=${encodeURIComponent(item._id ?? '')}`}>
                <button
                  className="
                    w-full bg-gradient-to-r from-[#0C1B33] to-[#1d2d50]
                    text-white px-4 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-300
                    hover:from-[#1d2d50] hover:to-[#0C1B33]
                    hover:shadow-lg hover:shadow-blue-300/30 
                    hover:scale-[1.02] active:scale-95
                  "
                >
                  Book Now
                </button>
              </Link>
            </div>
          </div>
          ))}
        </div>
      )}
    </section>
  );
}


