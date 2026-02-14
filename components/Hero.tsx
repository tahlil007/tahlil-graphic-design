
import React from 'react';
import { ArrowRight, ShoppingCart } from 'lucide-react';

interface HeroProps {
  onOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-6 pt-20 text-center relative z-10">
        <h2 className="text-[#d4af37] uppercase tracking-[0.6em] text-xs md:text-sm font-black mb-6 animate-fadeIn">Premium Graphic Solutions</h2>
        <h1 className="text-6xl md:text-9xl font-serif italic mb-8 leading-tight">
          Professional <br /> 
          <span className="gold-text not-italic font-sans font-black">Graphic Designer</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-light">
          Creative & Modern Design Solutions. <br className="hidden md:block" /> I transform complex brand visions into visually stunning, high-impact realities.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <a
            href="#portfolio"
            className="group px-12 py-5 border border-white/10 hover:border-[#d4af37] bg-white/5 hover:bg-transparent transition-all duration-500 flex items-center space-x-4 rounded-full"
          >
            <span className="uppercase tracking-[0.2em] text-xs font-black">View Portfolio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </a>
          <button
            onClick={onOrderClick}
            className="px-12 py-5 bg-[#d4af37] text-black uppercase tracking-[0.2em] text-xs font-black rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_15px_35px_rgba(212,175,55,0.3)] flex items-center space-x-3"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Order Now</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
        <div className="w-[1px] h-24 bg-gradient-to-b from-[#d4af37] to-transparent"></div>
      </div>
    </section>
  );
};

export default Hero;
