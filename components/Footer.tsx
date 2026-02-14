
import React from 'react';
import { Crown } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-black border-t border-white/5">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center space-x-2">
          <Crown className="w-6 h-6 text-[#d4af37]" />
          <span className="text-lg font-bold tracking-tighter uppercase font-serif italic gold-text">Tahlil DesignGold</span>
        </div>
        
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Tahlil DesignGold Portfolio. All Rights Reserved.
        </p>
        
        <div className="flex space-x-6 text-xs uppercase tracking-widest text-gray-500">
          <a href="#" className="hover:text-[#d4af37]">Privacy Policy</a>
          <a href="#" className="hover:text-[#d4af37]">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;