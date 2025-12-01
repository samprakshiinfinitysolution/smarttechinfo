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
      </div>
    </footer>
  );
}
