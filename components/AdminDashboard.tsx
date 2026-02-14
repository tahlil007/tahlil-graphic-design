
import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import { portfolioService } from '../services/portfolioService';
import { firebaseService } from '../services/firebaseService';
import { OrderData, OrderStatus, Category, Project } from '../types';
import { SUB_CATEGORIES } from '../constants';
import { 
  Crown, LogOut, Package, Trash2, Search, ArrowLeft,
  CheckCircle, Plus, Image as ImageIcon,
  Download, Briefcase, Edit3, AlertCircle, Send
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'orders' | 'portfolio';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [projectForm, setProjectForm] = useState<Omit<Project, 'id'>>({
    title: '', category: Category.Logo, subCategory: SUB_CATEGORIES[Category.Logo][0], description: '', imageUrl: ''
  });

  useEffect(() => {
    refreshData();
    
    // Background Firebase Sync
    firebaseService.syncOrders((cloudOrders) => {
      const localOrders = orderService.getOrders();
      cloudOrders.forEach(co => {
        if (!localOrders.find(lo => lo.id === co.id)) {
          orderService.importOrder(co);
        }
      });
      refreshData();
    });

    const handleUpdate = () => refreshData();
    window.addEventListener('ordersUpdated', handleUpdate);
    window.addEventListener('portfolioUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('ordersUpdated', handleUpdate);
      window.removeEventListener('portfolioUpdated', handleUpdate);
    };
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const refreshData = () => {
    setOrders(orderService.getOrders());
    setProjects(portfolioService.getProjects());
  };

  const handleStatusChange = (id: string, status: OrderStatus) => {
    orderService.updateOrderStatus(id, status);
    refreshData();
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    showFeedback("Status updated");
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('Delete this record?')) {
      orderService.deleteOrder(id);
      refreshData();
      setSelectedOrder(null);
    }
  };

  const handleDownloadBackup = () => {
    const data = { orders, projects, date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `designgold_backup.json`;
    link.click();
    showFeedback("Backup saved to PC");
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    portfolioService.addProject(projectForm);
    refreshData();
    setIsModalOpen(false);
    showFeedback("Project Published");
  };

  const filteredOrders = useMemo(() => orders.filter(o => o.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())), [orders, searchQuery]);
  const filteredProjects = useMemo(() => projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())), [projects, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row font-sans">
      {notification && (
        <div className="fixed top-6 right-6 z-[200] animate-slideDown bg-[#d4af37] text-black px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center space-x-3">
          <CheckCircle className="w-5 h-5" /> <span>{notification.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-80 bg-black border-r border-white/5 p-8 flex flex-col shrink-0">
        <div className="flex items-center space-x-3 mb-12">
          <Crown className="w-10 h-10 text-[#d4af37]" />
          <span className="font-serif italic gold-text text-2xl">Studio Admin</span>
        </div>

        <nav className="space-y-2 mb-10">
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl ${activeTab === 'orders' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
            <Package className="w-5 h-5" /> <span className="text-[10px] uppercase tracking-widest">Orders</span>
          </button>
          <button onClick={() => setActiveTab('portfolio')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl ${activeTab === 'portfolio' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
            <ImageIcon className="w-5 h-5" /> <span className="text-[10px] uppercase tracking-widest">Portfolio</span>
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <button onClick={handleDownloadBackup} className="w-full py-4 border border-white/10 rounded-xl text-[9px] uppercase font-black tracking-widest flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" /> <span>Save PC Backup</span>
          </button>
          <button onClick={onLogout} className="w-full py-4 text-red-500/50 hover:text-red-500 text-[10px] uppercase font-black bg-red-500/5 rounded-xl">
            <LogOut className="w-4 h-4 inline mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen bg-[#050505] custom-scrollbar">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif italic">{activeTab === 'orders' ? 'Inbound Orders' : 'Gallery Studio'}</h1>
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-900 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs outline-none" />
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {filteredOrders.map(order => (
                <div key={order.id} onClick={() => setSelectedOrder(order)} className={`p-8 rounded-[2rem] border transition-all cursor-pointer ${selectedOrder?.id === order.id ? 'bg-neutral-900 border-[#d4af37]' : 'bg-neutral-900/40 border-white/5'}`}>
                  <h4 className="font-bold text-xl mb-2">{order.projectTitle}</h4>
                  <p className="text-[10px] text-gray-500 uppercase font-black">{order.name} • {order.status}</p>
                </div>
              ))}
            </div>
            {selectedOrder && (
              <div className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-10 animate-fadeIn h-fit">
                <h3 className="text-2xl font-serif italic mb-6">{selectedOrder.projectTitle}</h3>
                <div className="space-y-4 mb-10 text-sm">
                   <p><span className="text-gray-500 uppercase text-[9px] font-black mr-2">Client:</span> {selectedOrder.name}</p>
                   <p><span className="text-gray-500 uppercase text-[9px] font-black mr-2">WhatsApp:</span> {selectedOrder.whatsapp}</p>
                   <div className="p-6 bg-black/40 rounded-2xl italic">"{selectedOrder.details}"</div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Completed)} className="flex-1 py-4 bg-[#d4af37] text-black font-black uppercase text-[10px] rounded-xl">Done</button>
                  <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="p-4 bg-red-500/10 text-red-500 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             <button onClick={() => setIsModalOpen(true)} className="aspect-[4/5] border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center hover:border-[#d4af37] transition-all group">
                <Plus className="w-12 h-12 text-gray-700 group-hover:text-[#d4af37]" />
             </button>
             {filteredProjects.map(p => (
               <div key={p.id} className="bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-white/5 relative group">
                 <img src={p.imageUrl} className="w-full h-full object-cover opacity-60" />
                 <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black to-transparent">
                   <h4 className="font-bold text-lg">{p.title}</h4>
                   <button onClick={() => portfolioService.deleteProject(p.id)} className="absolute top-4 right-4 p-3 bg-red-600 rounded-xl opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-10 animate-modalPop">
            <h3 className="text-3xl font-serif italic mb-8">Publish New Project</h3>
            <form onSubmit={handleProjectSubmit} className="space-y-6">
              <input required type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 outline-none" placeholder="Project Title" />
              <select value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value as Category})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 outline-none">
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="flex gap-4">
                <input type="file" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setProjectForm({...projectForm, imageUrl: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }} className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-3 text-xs" />
              </div>
              <button type="submit" className="w-full py-5 bg-[#d4af37] text-black font-black uppercase text-xs rounded-2xl">Publish</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
