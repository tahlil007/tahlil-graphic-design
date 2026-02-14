
import React from 'react';
import { ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';

interface HeroProps {
  onOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#d4af37]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-6 pt-20 text-center relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-8 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <h2 className="text-[#d4af37] uppercase tracking-[0.8em] text-[10px] md:text-xs font-black">Elite Visual Solutions</h2>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-serif italic mb-10 leading-[1.1] animate-slideUp">
          Premium <br /> 
          <span className="gold-text not-italic font-sans font-black tracking-tighter">Graphic Design</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto mb-16 leading-relaxed font-light animate-fadeIn">
          We architect digital identities and visual systems that command attention and drive conversions.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 animate-slideUp">
          <a
            href="#portfolio"
            className="group px-12 py-6 border border-white/5 hover:border-[#d4af37]/30 bg-white/2 hover:bg-white/5 transition-all duration-700 flex items-center space-x-5 rounded-full backdrop-blur-sm"
          >
            <span className="uppercase tracking-[0.3em] text-[10px] font-black">Studio Gallery</span>
            <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-black transition-all">
               <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>
          <button
            onClick={onOrderClick}
            className="px-14 py-6 bg-[#d4af37] text-black uppercase tracking-[0.3em] text-[10px] font-black rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.25)] flex items-center space-x-4"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Initiate Project</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20 hidden md:block">
        <div className="w-[1px] h-20 bg-gradient-to-b from-[#d4af37] to-transparent"></div>
      </div>
    </section>
  );
};

export default Hero;
