
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import Portfolio from './components/Portfolio.tsx';
import OrderForm from './components/OrderForm.tsx';
import About from './components/About.tsx';
import Contact from './components/Contact.tsx';
import Footer from './components/Footer.tsx';
import AdminLogin from './components/AdminLogin.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { orderService } from './services/orderService.ts';

type View = 'portfolio' | 'admin-login' | 'admin-dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('portfolio');
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Detect and Import Orders from URL (Smart Sync)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const importData = params.get('importOrder');
    
    if (importData) {
      try {
        const decodedOrder = JSON.parse(atob(importData));
        orderService.importOrder(decodedOrder);
        
        // Clear the URL parameter without refreshing the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Switch to Admin view to show the imported order
        setCurrentView('admin-login');
        alert("New order synchronized successfully! Please login to view.");
      } catch (e) {
        console.error("Failed to sync order:", e);
      }
    }
  }, []);

  // Auto-logout simulation after 15 minutes of inactivity
  useEffect(() => {
    if (currentView === 'admin-dashboard') {
      const timeout = setInterval(() => {
        if (Date.now() - lastActivity > 15 * 60 * 1000) {
          handleLogout();
        }
      }, 10000);
      return () => clearInterval(timeout);
    }
  }, [currentView, lastActivity]);

  const handleUserActivity = () => {
    if (currentView === 'admin-dashboard') setLastActivity(Date.now());
  };

  const openModal = () => setOrderModalOpen(true);
  const closeModal = () => setOrderModalOpen(false);

  const handleAdminAccess = () => {
    setCurrentView('admin-login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setCurrentView('admin-dashboard');
    setLastActivity(Date.now());
  };

  const handleLogout = () => {
    setCurrentView('portfolio');
  };

  if (currentView === 'admin-login') {
    return <AdminLogin onLogin={handleLoginSuccess} onBack={() => setCurrentView('portfolio')} />;
  }

  if (currentView === 'admin-dashboard') {
    return (
      <div onMouseMove={handleUserActivity} onKeyDown={handleUserActivity}>
        <AdminDashboard onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen custom-scrollbar overflow-x-hidden relative">
      <Navbar onOrderClick={openModal} />
      <Hero onOrderClick={openModal} />
      
      <div className="space-y-0">
        <Portfolio />
        <About />
        <Contact />
      </div>
      
      <footer className="py-12 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tighter uppercase font-serif italic gold-text">DesignGold</span>
          </div>
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} DesignGold Portfolio. All Rights Reserved.</p>
          <div className="flex space-x-6 text-[10px] uppercase tracking-widest text-gray-600">
            <button onClick={handleAdminAccess} className="hover:text-[#d4af37]">Admin Access</button>
            <a href="#" className="hover:text-[#d4af37]">Privacy</a>
          </div>
        </div>
      </footer>

      <OrderForm isOpen={isOrderModalOpen} onClose={closeModal} />
    </div>
  );
};

export default App;
