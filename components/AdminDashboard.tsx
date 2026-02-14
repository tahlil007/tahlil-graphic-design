
import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import { portfolioService } from '../services/portfolioService';
import { firebaseService } from '../services/firebaseService';
import { OrderData, OrderStatus, Category, Project } from '../types';
import { SUB_CATEGORIES } from '../constants';
import { 
  Crown, LogOut, Package, Trash2, Search, ArrowLeft,
  CheckCircle, Plus, Image as ImageIcon,
  Download, Briefcase, Edit3, AlertCircle, Send, Eye, X, ExternalLink, Copy, Mail, Phone, Calendar, Hash, User, Smartphone, UploadCloud, FileText, Type, ChevronRight
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
  const [fullImagePreview, setFullImagePreview] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<Omit<Project, 'id'>>({
    title: '', 
    category: Category.Logo, 
    subCategory: SUB_CATEGORIES[Category.Logo][0], 
    description: '', 
    imageUrl: ''
  });

  useEffect(() => {
    refreshData();
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showFeedback(`${label} copied to clipboard`);
  };

  const refreshData = () => {
    const sortedOrders = [...orderService.getOrders()].sort((a, b) => b.createdAt - a.createdAt);
    setOrders(sortedOrders);
    setProjects(portfolioService.getProjects());
  };

  const handleStatusChange = (id: string, status: OrderStatus) => {
    orderService.updateOrderStatus(id, status);
    refreshData();
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    showFeedback(`Order marked as ${status}`);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete this order record?')) {
      orderService.deleteOrder(id);
      refreshData();
      setSelectedOrder(null);
    }
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.imageUrl) {
      showFeedback('Please select a project image', 'error');
      return;
    }
    try {
      portfolioService.addProject(projectForm);
      showFeedback('Project published successfully to studio gallery');
      setIsModalOpen(false);
      setProjectForm({
        title: '',
        category: Category.Logo,
        subCategory: SUB_CATEGORIES[Category.Logo][0],
        description: '',
        imageUrl: ''
      });
      refreshData();
    } catch (error: any) {
      showFeedback(error.message || 'Failed to publish project', 'error');
    }
  };

  const filteredOrders = useMemo(() => orders.filter(o => 
    o.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [orders, searchQuery]);

  const filteredProjects = useMemo(() => projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())), [projects, searchQuery]);
  const availableSubCategories = useMemo(() => SUB_CATEGORIES[projectForm.category], [projectForm.category]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] animate-slideDown bg-[#d4af37] text-black px-8 py-4 rounded-full shadow-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-3 border border-white/20">
          <CheckCircle className="w-4 h-4" /> <span>{notification.message}</span>
        </div>
      )}

      {/* Full Asset Viewer */}
      {fullImagePreview && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setFullImagePreview(null)}></div>
          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center">
            <button onClick={() => setFullImagePreview(null)} className="absolute -top-16 right-0 p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all">
              <X className="w-8 h-8 text-white" />
            </button>
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
              <img src={fullImagePreview} className="w-full h-full object-contain" alt="HD View" />
            </div>
          </div>
        </div>
      )}

      {/* Side Menu */}
      <div className="w-full md:w-80 bg-black border-r border-white/5 p-10 flex flex-col shrink-0">
        <div className="flex items-center space-x-4 mb-16">
          <div className="w-12 h-12 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center border border-[#d4af37]/20">
            <Crown className="w-7 h-7 text-[#d4af37]" />
          </div>
          <div>
            <span className="block font-serif italic gold-text text-xl">Tahlil Gold</span>
            <span className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-black">Admin Terminal</span>
          </div>
        </div>

        <nav className="space-y-3">
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all ${activeTab === 'orders' ? 'bg-[#d4af37] text-black shadow-lg scale-[1.02]' : 'text-gray-500 hover:bg-white/5'}`}>
            <div className="flex items-center space-x-4">
              <Package className="w-5 h-5" />
              <span className="text-[10px] uppercase font-black tracking-widest">Inbound Orders</span>
            </div>
            {orders.some(o => o.status === OrderStatus.New) && <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>}
          </button>
          <button onClick={() => setActiveTab('portfolio')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all ${activeTab === 'portfolio' ? 'bg-[#d4af37] text-black shadow-lg scale-[1.02]' : 'text-gray-500 hover:bg-white/5'}`}>
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black tracking-widest">Studio Gallery</span>
          </button>
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5">
          <button onClick={onLogout} className="w-full py-5 text-red-500/50 hover:text-red-500 text-[9px] uppercase font-black bg-red-500/5 rounded-2xl transition-all flex items-center justify-center space-x-3">
            <LogOut className="w-4 h-4" /> 
            <span>Terminate Session</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-14 overflow-y-auto max-h-screen bg-[#050505] custom-scrollbar">
        <header className="flex flex-col xl:flex-row justify-between xl:items-center mb-16 gap-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif italic mb-2">{activeTab === 'orders' ? 'Command Center' : 'Asset Management'}</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black">Decrypting {activeTab} Intelligence Database</p>
          </div>
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-[#d4af37] transition-colors" />
            <input 
              type="text" 
              placeholder="Filter database..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-neutral-900/40 border border-white/5 rounded-2xl pl-16 pr-8 py-5 text-sm outline-none focus:border-[#d4af37] transition-all placeholder:text-gray-800" 
            />
          </div>
        </header>

        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-14 items-start">
            {/* List Column */}
            <div className="xl:col-span-5 space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
              {filteredOrders.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem]">
                  <AlertCircle className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">No matching records</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)} 
                    className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative group ${selectedOrder?.id === order.id ? 'bg-neutral-900 border-[#d4af37] shadow-2xl' : 'bg-neutral-900/30 border-white/5 hover:border-white/10'}`}
                  >
                    {order.status === OrderStatus.New && <div className="absolute top-8 right-8 w-2 h-2 bg-[#d4af37] rounded-full"></div>}
                    <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest block mb-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <h4 className="font-bold text-2xl mb-3 pr-8 truncate">{order.projectTitle}</h4>
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] text-gray-500 font-black uppercase">{order.name}</span>
                      <ChevronRight className="w-3 h-3 text-gray-800" />
                      <span className={`text-[10px] font-black uppercase ${order.status === OrderStatus.Completed ? 'text-green-500' : 'text-[#d4af37]'}`}>{order.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail Column */}
            <div className="xl:col-span-7">
              {selectedOrder ? (
                <div className="bg-neutral-900 border border-white/10 rounded-[3rem] p-10 md:p-14 animate-fadeIn shadow-2xl space-y-12">
                  <div className="flex justify-between items-start border-b border-white/5 pb-10">
                    <div>
                      <h3 className="text-4xl md:text-5xl font-serif italic mb-2">{selectedOrder.projectTitle}</h3>
                      <p className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.4em]">Order ID: #{selectedOrder.id.slice(0,6)}</p>
                    </div>
                    <div className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedOrder.status === OrderStatus.Completed ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20'}`}>
                      {selectedOrder.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 text-gray-500">
                        <User className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Client Identity</span>
                      </div>
                      <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                         <div>
                            <span className="text-gray-700 text-[9px] font-black uppercase block mb-1">Full Name</span>
                            <p className="text-lg font-bold">{selectedOrder.name}</p>
                         </div>
                         <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-700 text-[9px] font-black uppercase block mb-1">WhatsApp</span>
                              <p className="text-lg font-black text-[#d4af37]">{selectedOrder.whatsapp}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => copyToClipboard(selectedOrder.whatsapp, 'WhatsApp')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"><Copy className="w-4 h-4 text-gray-500" /></button>
                              <a href={`https://wa.me/${selectedOrder.whatsapp.replace(/\D/g,'')}`} target="_blank" className="p-3 bg-green-500/10 rounded-xl hover:bg-green-500/20 transition-all"><Smartphone className="w-4 h-4 text-green-500" /></a>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 text-gray-500">
                        <Hash className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Specifications</span>
                      </div>
                      <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <span className="text-gray-700 text-[9px] font-black uppercase block mb-1">Category</span>
                               <p className="text-sm font-bold truncate">{selectedOrder.category}</p>
                            </div>
                            <div>
                               <span className="text-gray-700 text-[9px] font-black uppercase block mb-1">Type</span>
                               <p className="text-sm font-bold truncate">{selectedOrder.subCategory}</p>
                            </div>
                         </div>
                         <div>
                            <span className="text-gray-700 text-[9px] font-black uppercase block mb-1">Target Deadline</span>
                            <p className="text-sm font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-[#d4af37]" /> {selectedOrder.deadline || 'ASAP'}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-gray-500">
                      <FileText className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Project Narrative</span>
                    </div>
                    <div className="p-10 bg-black/60 rounded-[3rem] border border-white/5 text-lg text-gray-300 leading-relaxed font-light shadow-inner italic">
                      "{selectedOrder.details}"
                    </div>
                  </div>

                  {selectedOrder.referenceFile && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 text-gray-500">
                          <ImageIcon className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Visual Assets</span>
                        </div>
                        <button onClick={() => setFullImagePreview(selectedOrder.referenceFile!)} className="text-[9px] font-black uppercase tracking-widest text-[#d4af37] hover:text-white transition-colors">HD Inspect</button>
                      </div>
                      <div className="relative group rounded-[3rem] overflow-hidden border border-white/10 aspect-video bg-black cursor-zoom-in" onClick={() => setFullImagePreview(selectedOrder.referenceFile!)}>
                        <img src={selectedOrder.referenceFile} className="w-full h-full object-contain p-8 group-hover:scale-105 transition-all duration-[2s]" alt="Reference" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <Eye className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-white/5">
                    {selectedOrder.status !== OrderStatus.InProgress && selectedOrder.status !== OrderStatus.Completed && (
                       <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.InProgress)} className="flex-1 py-7 bg-white/5 text-white border border-white/10 font-black uppercase text-[10px] tracking-widest rounded-3xl hover:bg-white/10 transition-all">Start Workflow</button>
                    )}
                    <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Completed)} className={`flex-1 py-7 font-black uppercase text-[10px] tracking-widest rounded-3xl transition-all shadow-xl ${selectedOrder.status === OrderStatus.Completed ? 'bg-green-500/10 text-green-500 border border-green-500/20 pointer-events-none' : 'bg-[#d4af37] text-black hover:bg-white'}`}>
                       {selectedOrder.status === OrderStatus.Completed ? 'Archive Complete' : 'Finalize Delivery'}
                    </button>
                    <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="p-7 bg-red-500/5 text-red-500/50 border border-red-500/10 rounded-3xl hover:bg-red-500 hover:text-white transition-all group">
                      <Trash2 className="w-6 h-6 group-hover:scale-110 transition-all" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[70vh] flex flex-col items-center justify-center p-20 text-center space-y-10 animate-fadeIn bg-neutral-900/10 border border-dashed border-white/5 rounded-[4rem]">
                   <div className="w-32 h-32 bg-white/2 rounded-full flex items-center justify-center border border-white/5 relative">
                      <div className="absolute inset-0 border border-[#d4af37]/20 rounded-full animate-ping opacity-20"></div>
                      <Package className="w-12 h-12 text-gray-800" />
                   </div>
                   <div className="max-w-xs">
                     <h3 className="text-3xl font-serif italic mb-2">System Ready</h3>
                     <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] leading-relaxed">Select an intelligence node to begin decryption of project data</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Portfolio Tab UI */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
             <button onClick={() => setIsModalOpen(true)} className="aspect-[4/5] border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center hover:border-[#d4af37] transition-all group bg-white/2 hover:bg-[#d4af37]/5">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-black transition-all mb-6">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 group-hover:text-white">Publish Asset</span>
             </button>
             {filteredProjects.map(p => (
               <div key={p.id} className="bg-neutral-900 rounded-[3rem] overflow-hidden border border-white/5 relative group aspect-[4/5] shadow-2xl">
                 <img src={p.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt={p.title} />
                 <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                   <h4 className="font-bold text-2xl mb-1">{p.title}</h4>
                   <p className="text-[9px] uppercase tracking-widest text-[#d4af37] font-black mb-6">{p.category}</p>
                   <button onClick={() => portfolioService.deleteProject(p.id)} className="absolute top-8 right-8 p-4 bg-red-600 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl">
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Modal: Add Portfolio Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-10 md:p-16 animate-modalPop shadow-[0_50px_100px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-start mb-12">
               <div>
                 <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.4em] block mb-2">Studio Archive</span>
                 <h3 className="text-4xl md:text-5xl font-serif italic gold-text">Ingest New Creative Asset</h3>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"><X className="w-8 h-8" /></button>
            </header>

            <form onSubmit={handleProjectSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-7 space-y-10">
                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2"><Type className="w-4 h-4" /> Asset Title *</label>
                   <input required type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-6 outline-none focus:border-[#d4af37] transition-all text-sm placeholder:text-gray-800" placeholder="e.g. Modern Gaming Brand" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Discipline</label>
                     <select value={projectForm.category} onChange={e => {
                       const newCat = e.target.value as Category;
                       setProjectForm({...projectForm, category: newCat, subCategory: SUB_CATEGORIES[newCat][0]});
                     }} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-6 outline-none focus:border-[#d4af37] transition-all text-sm appearance-none cursor-pointer">
                        {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                   </div>
                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Specialization</label>
                     <select value={projectForm.subCategory} onChange={e => setProjectForm({...projectForm, subCategory: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-6 outline-none focus:border-[#d4af37] transition-all text-sm appearance-none cursor-pointer">
                        {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                     </select>
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2"><FileText className="w-4 h-4" /> Project Narrative</label>
                   <textarea rows={6} value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-[2rem] px-8 py-8 outline-none focus:border-[#d4af37] transition-all text-sm resize-none placeholder:text-gray-800" placeholder="Describe the design strategy and objective..." />
                </div>
              </div>

              <div className="lg:col-span-5 space-y-10">
                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2"><ImageIcon className="w-4 h-4" /> Master Asset File *</label>
                   <div className="relative group rounded-[3rem] border-2 border-dashed border-white/10 aspect-[4/5] bg-black hover:border-[#d4af37] transition-all flex flex-col items-center justify-center p-4">
                      {projectForm.imageUrl ? (
                        <div className="relative w-full h-full group/inner">
                          <img src={projectForm.imageUrl} className="w-full h-full object-contain rounded-2xl" />
                          <button type="button" onClick={() => setProjectForm({...projectForm, imageUrl: ''})} className="absolute top-4 right-4 p-3 bg-red-600 rounded-xl opacity-0 group-hover/inner:opacity-100 transition-all"><Trash2 className="w-5 h-5 text-white" /></button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-4">
                           <UploadCloud className="w-12 h-12 text-gray-800 group-hover:text-[#d4af37] transition-colors" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sync Original Asset</p>
                        </div>
                      )}
                      <input type="file" required={!projectForm.imageUrl} className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                        const file = e.target.files?.[0];
                        if(file) {
                          const r = new FileReader();
                          r.onloadend = () => setProjectForm({...projectForm, imageUrl: r.result as string});
                          r.readAsDataURL(file);
                        }
                      }} />
                   </div>
                </div>
                <button type="submit" className="w-full py-8 bg-[#d4af37] text-black font-black uppercase text-[10px] tracking-[0.4em] rounded-3xl hover:bg-white transition-all shadow-2xl hover:scale-[1.02]">Archive Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
