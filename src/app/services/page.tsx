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
      const res = await fetch('http://localhost:5000/api/services/active');
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
      <section className="w-full text-black py-16 bg-white">
        <div className="text-center">
          <p className="text-lg">Loading services...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="w-full text-black py-16 bg-white">
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((item: any, index: number) => (
          <div
            key={item._id ?? item.id ?? index}
            className="
              relative bg-white rounded-2xl border border-gray-200 
              shadow-sm p-4 transition-all duration-300 
              hover:shadow-2xl hover:scale-[1.04] hover:border-gray-300
              flex flex-col justify-between
            "
          >
            {/* Top Badge */}
            <div className="absolute top-3 left-3 bg-[#0C1B33] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              Expert Assured
            </div>

            {/* Tool Icon */}
            <div className="absolute top-3 right-3 text-gray-600 text-xl">
              🛠️
            </div>

            {/* Image */}
            <div className="overflow-hidden rounded-xl mt-6 flex-1 flex items-center justify-center">
              <img
                src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : '/placeholder.jpg'}
                alt={item.name || item.title}
                className="w-full h-56 object-contain transition-all duration-300 hover:scale-110"
              />
            </div>

            {/* Bottom Section */}
            <div className="border-t mt-4 pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold">{item.name || item.title}</h4>
                {item.serviceCharges && (
                  <div className="mt-2">
                    <p className="text-gray-500 text-xs">Service Charge</p>
                    <p className="text-blue-600 font-bold text-lg">₹{item.serviceCharges}</p>
                  </div>
                )}
              </div>

                {/* ⭐ Perfect Responsive Button ⭐ */}
                <Link href={`/book?service=${encodeURIComponent(item.name || item.title)}`}>
                <button
                className="
                  bg-linear-to-r from-[#0C1B33] to-[#1d2d50]
                  text-white px-4 py-2 rounded-xl text-sm font-medium
                  min-w-[110px] text-center
                  transition-all duration-300
                  hover:from-[#1d2d50] hover:to-[#0C1B33]
                  hover:shadow-lg hover:shadow-blue-300/30 
                  hover:scale-110 active:scale-95
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
