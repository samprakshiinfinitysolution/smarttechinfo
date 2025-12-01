"use client";
import { useState } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";

interface LocationPickerProps {
  address: string;
  setAddress: (address: string) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function LocationPicker({ address, setAddress, onLocationSelect }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState<{ lat: number; lng: number } | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationData({ lat: latitude, lng: longitude });
        
        // Reverse geocoding with multiple fallbacks
        try {
          // Try Nominatim first
          let response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'SmartTechInfo' } }
          );
          
          if (!response.ok) {
            // Fallback to BigDataCloud (no API key needed)
            response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
          }
          
          const data = await response.json();
          
          // Format address based on response structure
          let formattedAddress = '';
          if (data.display_name) {
            // Nominatim response
            formattedAddress = data.display_name;
          } else if (data.locality) {
            // BigDataCloud response
            formattedAddress = `${data.locality}, ${data.city || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`;
          } else {
            formattedAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }
          
          setAddress(formattedAddress);
          onLocationSelect?.(latitude, longitude);
        } catch (error) {
          console.error('Geocoding error:', error);
          setAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          onLocationSelect?.(latitude, longitude);
        }
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        let errorMsg = "Unable to retrieve your location. ";
        if (error.code === 1) errorMsg += "Permission denied.";
        else if (error.code === 2) errorMsg += "Position unavailable.";
        else if (error.code === 3) errorMsg += "Timeout.";
        alert(errorMsg + " Please enter manually.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div>
      <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
        <MapPin className="w-4 h-4" />
        Service Address *
      </label>
      
      <div className="space-y-3">
        <textarea
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your complete address"
          className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors resize-none"
        />
        
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              Use My Current Location
            </>
          )}
        </button>

        {locationData && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location captured: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
