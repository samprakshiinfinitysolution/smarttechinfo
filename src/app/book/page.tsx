"use client";
import { useState, useEffect, Suspense } from "react";
import {
  User,
  Mail,
  Phone,
  Home,
  Clock,
  FileText,
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Wrench,
  CreditCard,
  Wallet,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
// Thank you UI replaced by redirect to dashboard on successful booking
import Toast from "@/components/Toast";
import LocationPicker from "@/components/LocationPicker";

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [issue, setIssue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  // booking completion handled by redirect; no local 'done' state needed
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [serviceCharges, setServiceCharges] = useState<Record<string, number>>({});
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
        const fetchServices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/services/active`);
        const data = await res.json();
        const servicesList = data.services || [];
        setServices(servicesList);
        
        const chargesMap: Record<string, number> = {};
        servicesList.forEach((s: any) => {
          // prefer serviceCharges, fallback to price
          chargesMap[s.name] = s.serviceCharges ?? s.price ?? 0;
        });
        setServiceCharges(chargesMap);
        
        // Auto-select service from URL parameter
            const serviceParam = searchParams.get('service');
            const priceParam = searchParams.get('price');
            if (serviceParam) {
              setService(serviceParam);
              // If price provided in URL, prefer it for this session
              if (priceParam && !isNaN(Number(priceParam))) {
                setServiceCharges(prev => ({ ...prev, [serviceParam]: Number(priceParam) }));
              }
            }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/user-login?redirect=/book");
      return;
    }
    
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setFullName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
    
    setIsAuthenticated(true);
  }, [router]);

  const handleBookingSubmit = async () => {
    try {
      if (!fullName || !phone || !address || !service || !date || !timeSlot) {
        setToast({ message: "Please fill all required fields", type: "warning" });
        return;
      }

      if (!/^[6-9]\d{9}$/.test(phone)) {
        setToast({ message: "Please enter a valid 10-digit Indian phone number", type: "error" });
        return;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setToast({ message: "Please enter a valid email address", type: "error" });
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setToast({ message: "Session expired. Redirecting to login...", type: "error" });
        setTimeout(() => router.push("/user-login?redirect=/book"), 2000);
        return;
      }

      const serviceCharge = serviceCharges[service] || 0;

      const bookingData = {
        service,
        date,
        time: timeSlot,
        amount: serviceCharge,
        ...(issue && { issue }),
        ...(locationCoords && { latitude: locationCoords.lat, longitude: locationCoords.lng }),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.message || "Booking failed", type: "error" });
        return;
      }

      setToast({ message: "Booking successful! Redirecting to dashboard...", type: "success" });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: "Something went wrong. Please try again", type: "error" });
    }
  };

  if (!isAuthenticated) return null;

  const serviceCharge = service ? serviceCharges[service] : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Book Your Service
          </h1>
          <p className="text-slate-600 text-lg">
            Quick, easy, and hassle-free booking in 2 simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { no: 1, label: "Details" },
            { no: 2, label: "Schedule" },
          ].map((item, idx) => (
            <div key={item.no} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    step >= item.no
                      ? "bg-gradient-to-br from-[#0C1B33] to-[#1e3a5f] text-white shadow-lg scale-110"
                      : "bg-white text-slate-400 border-2 border-slate-200"
                  }`}
                >
                  {step > item.no ? <CheckCircle2 className="w-6 h-6" /> : item.no}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    step >= item.no ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {idx < 1 && (
                <div
                  className={`h-1 w-16 md:w-24 rounded-full transition-all ${
                    step > item.no ? "bg-[#0C1B33]" : "bg-slate-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Personal Details</h2>
                      <p className="text-sm text-slate-500">Tell us about yourself</p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
                      <User className="w-4 h-4" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    {fullNameError && <p className="text-red-600 text-sm mt-1">{fullNameError}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                          setEmailError('Enter a valid email address');
                        } else {
                          setEmailError('');
                        }
                      }}
                      placeholder="your.email@example.com"
                      className={`w-full border-2 rounded-xl px-4 py-3 bg-white text-slate-900 focus:outline-none transition-colors ${
                        emailError ? 'border-red-500' : 'border-slate-400 focus:border-blue-500'
                      }`}
                    />
                    {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhone(val);
                        if (val && !/^[6-9]\d{9}$/.test(val)) {
                          setPhoneError('Enter valid 10-digit number starting with 6-9');
                        } else {
                          setPhoneError('');
                        }
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full border-2 rounded-xl px-4 py-3 bg-white text-slate-900 focus:outline-none transition-colors ${
                        phoneError ? 'border-red-500' : 'border-slate-400 focus:border-blue-500'
                      }`}
                    />
                    {phoneError && <p className="text-red-600 text-sm mt-1">{phoneError}</p>}
                  </div>

                  <LocationPicker
                    address={address}
                    setAddress={setAddress}
                    onLocationSelect={(lat, lng) => setLocationCoords({ lat, lng })}
                  />
                  {addressError && <p className="text-red-600 text-sm mt-1">{addressError}</p>}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => {
                        // validate required fields on step 1 before continuing
                        let ok = true;
                        if (!fullName || fullName.trim() === '') {
                          setFullNameError('Full name is required');
                          ok = false;
                        } else {
                          setFullNameError('');
                        }

                        if (!phone || phone.trim() === '') {
                          setPhoneError('Phone number is required');
                          ok = false;
                        } else if (!/^[6-9]\d{9}$/.test(phone)) {
                          setPhoneError('Enter valid 10-digit number starting with 6-9');
                          ok = false;
                        } else {
                          setPhoneError('');
                        }

                        if (!address || address.trim() === '') {
                          setAddressError('Address is required');
                          ok = false;
                        } else {
                          setAddressError('');
                        }

                        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                          setEmailError('Enter a valid email address');
                          ok = false;
                        } else {
                          // leave emailError as-is only if previously set
                          if (!email) setEmailError('');
                        }

                        if (ok) setStep(2);
                      }}
                      className="bg-gradient-to-r from-[#0C1B33] to-[#1e3a5f] text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Schedule Service</h2>
                      <p className="text-sm text-slate-500">Pick your preferred date & time</p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
                      <CalendarDays className="w-4 h-4" />
                      Select Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-3 font-medium text-slate-700">
                      <Clock className="w-4 h-4" />
                      Select Time Slot *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "9:00 AM – 11:00 AM",
                        "11:00 AM – 1:00 PM",
                        "1:00 PM – 3:00 PM",
                        "3:00 PM – 5:00 PM",
                        "5:00 PM – 7:00 PM",
                      ].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setTimeSlot(slot)}
                          className={`border-2 rounded-xl px-4 py-3 font-medium transition-all ${
                            timeSlot === slot
                              ? "border-[#0C1B33] bg-[#0C1B33] text-white shadow-md"
                              : "border-slate-300 hover:border-slate-400 text-slate-900 bg-white"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 font-medium text-slate-700">
                      <FileText className="w-4 h-4" />
                      Describe Issue (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="Tell us about the problem..."
                      className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={handleBookingSubmit}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}


            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Booking Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-2 block">
                    Select Service *
                  </label>
                  <select
                    className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="">Choose a service</option>
                    {services.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {service && (
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Wrench className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-slate-900">{service}</span>
                    </div>
                    <p className="text-sm text-slate-600">Professional service with warranty</p>
                  </div>
                )}
              </div>

              {service && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Service Charges</p>
                        <p className="text-3xl font-bold text-slate-900">₹{serviceCharge}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">All-inclusive service charge</p>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm">3 Months Warranty</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      On all repairs & replacements
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-600">Loading...</div></div>}>
      <BookingForm />
    </Suspense>
  );
}
