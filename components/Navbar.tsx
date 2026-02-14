
import React, { useState, useEffect } from 'react';
import { Menu, X, Crown } from 'lucide-react';

interface NavbarProps {
  onOrderClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOrderClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a href="#home" className="flex items-center space-x-2">
          <Crown className="w-8 h-8 text-[#d4af37]" />
          <span className="text-xl font-bold tracking-tighter uppercase font-serif italic gold-text">Tahlil DesignGold</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-bold hover:text-[#d4af37] transition-colors uppercase tracking-[0.2em]"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={onOrderClick}
            className="px-6 py-2 bg-[#d4af37] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            Order Now
          </button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-white/10 flex flex-col p-6 space-y-4 md:hidden animate-slideDown">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium hover:text-[#d4af37] py-2 border-b border-white/5"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => { setIsOpen(false); onOrderClick(); }}
            className="w-full py-4 bg-[#d4af37] text-black font-black uppercase tracking-widest text-xs"
          >
            Order Now
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;