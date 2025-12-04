import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0C1B33] text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Logo & About */}
        <div
          className="transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/LOGO1.png"
              alt="Smart TechInfo"
              className="w-12 h-12 rounded-full bg-white shadow-md shadow-blue-900/40"
            />
            <h2 className="text-xl font-semibold text-white">Smart Techinfo</h2>
          </div>

          <p className="text-sm leading-relaxed">
            Professional home appliance and electronics repair services.
            <br />
            Quality assured, trusted by thousands.
          </p>

          <div className="flex items-center gap-4 mt-4 md:hidden">
            <a href="https://instagram.com/smart_techinfo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all duration-300 hover:scale-125"><Instagram className="w-5 h-5" /></a>
            <a href="https://facebook.com/Smart-techinfo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all duration-300 hover:scale-125"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div
          className="transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li className="cursor-pointer hover:text-white hover:translate-x-2 duration-200">
              About Us
            </li>
            <li className="cursor-pointer hover:text-white hover:translate-x-2 duration-200">
              Our Services
            </li>
          </ul>
        </div>

        {/* Services */}
        <div
          className="transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
          <h3 className="text-white font-semibold mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            {[
              "Washing Machine",
              "Refrigerator",
              "Air Conditioner",
              "Television",
            ].map((service, i) => (
              <li
                key={i}
                className="cursor-pointer hover:text-white hover:translate-x-2 duration-200"
              >
                {service}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div
          className="transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>

          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-4 h-4" />
            <div className="flex flex-col gap-1">
              <a href="tel:+919685530890" className="underline hover:text-white">9685530890</a>
              <a href="tel:+918839665594" className="underline hover:text-white">8839665594</a>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-4 h-4" />
            <a href="mailto:smarttechinfo68@gmail.com" className="underline hover:text-white">smarttechinfo68@gmail.com</a>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              123 Service Street, Mumbai,
              <br /> India
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-gray-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-center md:text-left">
            © 2025 Smart Techinfo. All rights reserved.
          </p>

          <div className="hidden md:flex items-center gap-4">
            <a href="https://instagram.com/smart_techinfo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all duration-300 hover:scale-125"><Instagram className="w-5 h-5" /></a>
            <a href="https://facebook.com/Smart-techinfo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all duration-300 hover:scale-125"><Facebook className="w-5 h-5" /></a>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="inline-block w-16 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-blue-500/30"></span>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <span>Managed & Developed with</span>
              <svg className="w-3.5 h-3.5 text-red-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>by</span>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 transition-all duration-300">Samprakshi Infinity Solution</span>
            </p>
            <span className="inline-block w-16 h-px bg-gradient-to-l from-transparent via-blue-500/30 to-blue-500/30"></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
