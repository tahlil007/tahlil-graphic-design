
import React from 'react';
import { Mail, MessageCircle, Facebook, Instagram, Twitter, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-24 bg-[#050505] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[#d4af37] uppercase tracking-widest text-sm mb-2">Get in Touch</h2>
          <h3 className="text-4xl md:text-5xl font-serif italic mb-12">Let's Connect</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <a 
              href="https://wa.me/yournumber" 
              className="group p-8 bg-neutral-900 border border-white/5 rounded-2xl hover:border-[#d4af37] transition-all flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-green-500/10 flex items-center justify-center rounded-full mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-green-500" />
              </div>
              <h4 className="font-bold text-lg mb-1">WhatsApp</h4>
              <p className="text-gray-500 text-sm">Instant Chat</p>
            </a>

            <a 
              href="mailto:contact@designgold.com" 
              className="group p-8 bg-neutral-900 border border-white/5 rounded-2xl hover:border-[#d4af37] transition-all flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-[#d4af37]/10 flex items-center justify-center rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-[#d4af37]" />
              </div>
              <h4 className="font-bold text-lg mb-1">Email</h4>
              <p className="text-gray-500 text-sm">Official Inquiries</p>
            </a>

            <div className="p-8 bg-neutral-900 border border-white/5 rounded-2xl flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-500/10 flex items-center justify-center rounded-full mb-4">
                <MapPin className="w-7 h-7 text-blue-500" />
              </div>
              <h4 className="font-bold text-lg mb-1">Location</h4>
              <p className="text-gray-500 text-sm">Available Worldwide</p>
            </div>
          </div>

          <div className="flex justify-center space-x-8">
            <a href="#" className="p-4 bg-white/5 rounded-full hover:bg-[#d4af37] hover:text-black transition-all">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="p-4 bg-white/5 rounded-full hover:bg-[#d4af37] hover:text-black transition-all">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="p-4 bg-white/5 rounded-full hover:bg-[#d4af37] hover:text-black transition-all">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
