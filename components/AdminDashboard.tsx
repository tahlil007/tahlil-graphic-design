
import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import { portfolioService } from '../services/portfolioService';
import { firebaseService, FirebaseConfig } from '../services/firebaseService';
import { OrderData, OrderStatus, Category, Project } from '../types';
import { SUB_CATEGORIES } from '../constants';
import { 
  Crown, LogOut, Package, Clock, CheckCircle, 
  Trash2, MessageCircle, Mail, ExternalLink,
  Search, User, ArrowLeft,
  Bell, BellRing, ArrowUpDown, Calendar, LayoutGrid,
  Check, Eye, ShieldCheck, Plus, Image as ImageIcon,
  FolderOpen, X, Upload, Download, Briefcase, Edit3, Settings2, Filter, AlertCircle, FileWarning, Send, Info, Smartphone, Database, Code, Cloud, CloudOff, Save
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type SortBy = 'date' | 'category' | 'status';
type Tab = 'orders' | 'portfolio' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All' | 'Unread'>('All');
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  
  // Cloud Settings State
  const [cloudConfig, setCloudConfig] = useState<FirebaseConfig>(firebaseService.getConfig() || {
    apiKey: '', authDomain: '', databaseURL: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
  });
  const isCloudEnabled = firebaseService.isConfigured();

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [projectForm, setProjectForm] = useState<Omit<Project, 'id'>>({
    title: '', category: Category.Logo, subCategory: SUB_CATEGORIES[Category.Logo][0], description: '', imageUrl: ''
  });

  useEffect(() => {
    refreshData();
    
    // Real-time Cloud Sync listener
    if (isCloudEnabled) {
      firebaseService.syncOrders((cloudOrders) => {
        const localOrders = orderService.getOrders();
        // Merge cloud orders into local if they don't exist
        cloudOrders.forEach(co => {
          if (!localOrders.find(lo => lo.id === co.id)) {
            orderService.importOrder(co);
          }
        });
        refreshData();
      });
    }

    const interval = setInterval(refreshOrdersOnly, 5000);
    const handleOrdersUpdate = () => refreshData();
    window.addEventListener('ordersUpdated', handleOrdersUpdate);
    window.addEventListener('portfolioUpdated', () => refreshData());
    window.addEventListener('storage', handleOrdersUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
      window.removeEventListener('storage', handleOrdersUpdate);
    };
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const refreshData = () => {
    const fetchedOrders = orderService.getOrders();
    const fetchedProjects = portfolioService.getProjects();
    setOrders(fetchedOrders);
    setProjects(fetchedProjects);
    setLastOrderCount(fetchedOrders.length);
  };

  const refreshOrdersOnly = () => {
    const fetchedOrders = orderService.getOrders();
    if (fetchedOrders.length > lastOrderCount && lastOrderCount !== 0) {
      showFeedback("New client order received!", "success");
    }
    setLastOrderCount(fetchedOrders.length);
    setOrders(fetchedOrders);
  };

  const handleManualImport = () => {
    if (!syncCode) return showFeedback("Please paste the Order Code.", "error");
    try {
      const decodedOrder = JSON.parse(atob(syncCode));
      orderService.importOrder(decodedOrder);
      setSyncCode('');
      setIsImportModalOpen(false);
      refreshData();
      showFeedback("Order imported successfully!", "success");
    } catch (e) {
      showFeedback("Invalid Order Code.", "error");
    }
  };

  const handleDownloadBackup = () => {
    const data = {
      orders: orders,
      projects: projects,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `designgold_backup_${new Date().toLocaleDateString()}.json`;
    link.click();
    showFeedback("Database backup saved to computer!");
  };

  const saveCloudConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudConfig.apiKey || !cloudConfig.databaseURL) {
      return showFeedback("API Key and Database URL are required.", "error");
    }
    firebaseService.saveConfig(cloudConfig);
    showFeedback("Cloud configuration saved. System reloading...");
  };

  // Order & Project Handlers (Same as previous, omitted for brevity but they exist)
  const handleStatusChange = (id: string, status: OrderStatus) => {
    orderService.updateOrderStatus(id, status);
    refreshData();
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    showFeedback(`Order status updated to ${status}`);
  };

  const handleMarkAsRead = (id: string) => {
    orderService.markAsRead(id);
    refreshData();
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, read: true } : null);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('Delete this order?')) {
      orderService.deleteOrder(id);
      refreshData();
      setSelectedOrder(null);
      showFeedback("Order deleted");
    }
  };

  // Portfolio Logic
  const openAddModal = () => {
    setIsEditing(false);
    setProjectForm({ title: '', category: Category.Logo, subCategory: SUB_CATEGORIES[Category.Logo][0], description: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) portfolioService.updateProject(editingId, projectForm);
    else portfolioService.addProject(projectForm);
    refreshData();
    setIsModalOpen(false);
    showFeedback("Portfolio updated");
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm("Delete this asset?")) {
      portfolioService.deleteProject(id);
      refreshData();
      showFeedback("Asset deleted");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProjectForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = orders.filter(o => {
      let statusMatch = filterStatus === 'All' ? true : (filterStatus === 'Unread' ? !o.read : o.status === filterStatus);
      return statusMatch && (o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    result.sort((a, b) => sortBy === 'date' ? b.createdAt - a.createdAt : a.status.localeCompare(b.status));
    return result;
  }, [orders, filterStatus, searchQuery, sortBy]);

  const filteredProjects = useMemo(() => projects.filter(p => (portfolioCategoryFilter === 'All' || p.category === portfolioCategoryFilter) && p.title.toLowerCase().includes(searchQuery.toLowerCase())), [projects, portfolioCategoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row relative overflow-hidden font-sans">
      {notification && (
        <div className="fixed top-6 right-6 z-[200] animate-slideDown">
          <div className={`${notification.type === 'success' ? 'bg-[#d4af37]' : 'bg-red-500'} text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-white/10`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-bold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 bg-black border-r border-white/5 p-8 flex flex-col z-10 shrink-0">
        <div className="flex items-center space-x-3 mb-12">
          <Crown className="w-10 h-10 text-[#d4af37]" />
          <div>
            <span className="font-serif italic gold-text text-2xl block leading-none">Admin Panel</span>
            <span className="text-[7px] uppercase tracking-[0.3em] text-gray-600 font-black">Authorized Only</span>
          </div>
        </div>

        <nav className="space-y-1 mb-10">
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#d4af37] text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}>
            <div className="flex items-center space-x-3"><Package className="w-5 h-5" /><span className="text-[10px] uppercase tracking-widest">Client Orders</span></div>
          </button>
          
          <button onClick={() => setActiveTab('portfolio')} className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-[#d4af37] text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}>
            <div className="flex items-center space-x-3"><ImageIcon className="w-5 h-5" /><span className="text-[10px] uppercase tracking-widest">Gallery Control</span></div>
          </button>

          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-[#d4af37] text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}>
            <div className="flex items-center space-x-3"><Settings2 className="w-5 h-5" /><span className="text-[10px] uppercase tracking-widest">Cloud Sync</span></div>
            {isCloudEnabled ? <Cloud className="w-3 h-3 text-green-500" /> : <CloudOff className="w-3 h-3 text-gray-600" />}
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <button onClick={handleDownloadBackup} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center space-x-3 text-[9px] font-black uppercase tracking-widest hover:border-[#d4af37] transition-all">
            <Download className="w-4 h-4" />
            <span>Download Local Backup</span>
          </button>
          <button onClick={onLogout} className="w-full py-4 text-red-500/50 hover:text-red-500 transition-all text-[10px] uppercase tracking-widest font-black bg-red-500/5 rounded-xl">
            <LogOut className="w-4 h-4 inline mr-2" /> End Session
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen custom-scrollbar bg-[#050505]">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-serif italic mb-2 tracking-tight">
              {activeTab === 'orders' ? 'Engagement Pipeline' : activeTab === 'settings' ? 'Cloud Configuration' : 'Portfolio Studio'}
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black">DesignGold Control Hub</p>
          </div>

          {activeTab !== 'settings' && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-900 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-[#d4af37] outline-none" />
            </div>
          )}
        </div>

        {activeTab === 'settings' ? (
          <div className="max-w-3xl animate-fadeIn">
            <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-12 space-y-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCloudEnabled ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                  {isCloudEnabled ? <ShieldCheck className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-gray-500" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{isCloudEnabled ? 'Cloud Sync is Active' : 'Cloud Sync Disabled'}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Cross-device synchronization requires Firebase</p>
                </div>
              </div>

              <form onSubmit={saveCloudConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(cloudConfig).map((key) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gray-600 font-black ml-1">{key}</label>
                    <input 
                      type="text" 
                      value={(cloudConfig as any)[key]} 
                      onChange={(e) => setCloudConfig({...cloudConfig, [key]: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs focus:border-[#d4af37] outline-none"
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))}
                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full py-5 bg-[#d4af37] text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-all flex items-center justify-center space-x-3">
                    <Save className="w-4 h-4" />
                    <span>Save Cloud Configuration</span>
                  </button>
                  <p className="mt-4 text-center text-[9px] text-gray-600 leading-relaxed">
                    Note: Create a Firebase project and Realtime Database (Rules set to public) to use this feature. <br/>
                    All devices must use the same keys to sync data.
                  </p>
                </div>
              </form>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              {filteredAndSortedOrders.map(order => (
                <div key={order.id} onClick={() => { setSelectedOrder(order); if (!order.read) handleMarkAsRead(order.id); }} className={`p-10 rounded-[2.5rem] border transition-all cursor-pointer relative ${selectedOrder?.id === order.id ? 'bg-neutral-900 border-[#d4af37]' : 'bg-neutral-900/40 border-white/5'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-2xl">{order.projectTitle}</h4>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{order.status}</span>
                  </div>
                  <p className="text-[10px] uppercase text-gray-500 font-black">{order.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            {selectedOrder && (
              <div className="bg-neutral-900 border border-white/10 rounded-[3rem] p-12 sticky top-10">
                <h3 className="text-3xl font-serif italic mb-8">{selectedOrder.projectTitle}</h3>
                <div className="space-y-6 mb-12">
                   <div className="grid grid-cols-2 gap-4 text-[11px] uppercase tracking-widest">
                      <span className="text-gray-600">Client:</span> <span className="text-white">{selectedOrder.name}</span>
                      <span className="text-gray-600">Phone:</span> <span className="text-green-500">{selectedOrder.whatsapp}</span>
                   </div>
                   <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-sm italic">"{selectedOrder.details}"</div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Completed)} className="flex-1 py-4 bg-[#d4af37] text-black font-black uppercase text-[10px] rounded-xl">Complete Order</button>
                  <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="p-4 bg-red-500/10 text-red-500 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             <button onClick={openAddModal} className="aspect-[4/5] border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center hover:border-[#d4af37] transition-all group">
                <Plus className="w-12 h-12 text-gray-700 group-hover:text-[#d4af37]" />
                <span className="text-[10px] font-black uppercase tracking-widest mt-4">Add Project</span>
             </button>
             {filteredProjects.map(p => (
               <div key={p.id} className="bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-white/5 relative group">
                 <img src={p.imageUrl} className="w-full h-full object-cover opacity-60" />
                 <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black to-transparent">
                   <h4 className="font-bold text-xl">{p.title}</h4>
                   <button onClick={() => handleDeleteProject(p.id)} className="absolute top-4 right-4 p-3 bg-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-12 animate-modalPop max-h-[90vh] overflow-y-auto">
            <h3 className="text-4xl font-serif italic mb-8">Publish Asset</h3>
            <form onSubmit={handleProjectSubmit} className="space-y-8">
              <input required type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] outline-none" placeholder="Project Title" />
              <div className="grid grid-cols-2 gap-4">
                <select value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value as Category})} className="bg-black border border-white/10 rounded-2xl px-6 py-5 outline-none">
                  {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="file" onChange={handleImageUpload} className="bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs" />
              </div>
              {isUploading && <p className="text-[#d4af37] text-xs font-black animate-pulse">Uploading asset...</p>}
              <button type="submit" className="w-full py-6 bg-[#d4af37] text-black font-black uppercase text-xs rounded-2xl">Publish to Portfolio</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
