
import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import { portfolioService } from '../services/portfolioService';
import { firebaseService } from '../services/firebaseService';
import { OrderData, OrderStatus, Category, Project } from '../types';
import { SUB_CATEGORIES } from '../constants';
import { 
  Crown, LogOut, Package, Trash2, Search, ArrowLeft,
  CheckCircle, Plus, Image as ImageIcon,
  Download, Briefcase, Edit3, AlertCircle, Send, Eye, X, ExternalLink, Copy, Mail, Phone, Calendar, Hash, User, Smartphone
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
    title: '', category: Category.Logo, subCategory: SUB_CATEGORIES[Category.Logo][0], description: '', imageUrl: ''
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
    try {
      portfolioService.addProject(projectForm);
      showFeedback('Project published successfully');
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

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row font-sans">
      {notification && (
        <div className="fixed top-8 right-8 z-[300] animate-slideDown bg-[#d4af37] text-black px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-black text-xs uppercase tracking-widest flex items-center space-x-3 border-2 border-white/20">
          <CheckCircle className="w-5 h-5" /> <span>{notification.message}</span>
        </div>
      )}

      {/* Full Asset Viewer Modal */}
      {fullImagePreview && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setFullImagePreview(null)}></div>
          <div className="relative max-w-6xl w-full max-h-[95vh] flex flex-col items-center">
            <button onClick={() => setFullImagePreview(null)} className="absolute -top-16 right-0 p-4 text-white/50 hover:text-white transition-all bg-white/5 rounded-full">
              <X className="w-8 h-8" />
            </button>
            <div className="w-full h-full rounded-[3rem] overflow-hidden border border-white/10 bg-black/50 shadow-2xl">
              <img src={fullImagePreview} className="w-full h-full object-contain" alt="Reference Asset" />
            </div>
            <a href={fullImagePreview} download={`reference_${Date.now()}`} className="mt-8 px-12 py-5 bg-[#d4af37] text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-white transition-all shadow-xl">
              Download Raw Asset
            </a>
          </div>
        </div>
      )}

      {/* Navigation Sidebar */}
      <div className="w-full md:w-80 bg-black border-r border-white/5 p-10 flex flex-col shrink-0">
        <div className="flex items-center space-x-4 mb-16 px-2">
          <div className="w-12 h-12 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center border border-[#d4af37]/20">
            <Crown className="w-7 h-7 text-[#d4af37]" />
          </div>
          <div>
            <span className="block font-serif italic gold-text text-2xl leading-none">Terminal</span>
            <span className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">Secure Admin</span>
          </div>
        </div>

        <nav className="space-y-4 mb-16">
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all ${activeTab === 'orders' ? 'bg-[#d4af37] text-black font-black' : 'text-gray-500 hover:bg-white/5'}`}>
            <div className="flex items-center space-x-4">
              <Package className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-[0.2em]">Orders</span>
            </div>
            {orders.filter(o => o.status === OrderStatus.New).length > 0 && (
              <span className={`w-2 h-2 rounded-full ${activeTab === 'orders' ? 'bg-black' : 'bg-[#d4af37]'} animate-pulse`}></span>
            )}
          </button>
          <button onClick={() => setActiveTab('portfolio')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all ${activeTab === 'portfolio' ? 'bg-[#d4af37] text-black font-black' : 'text-gray-500 hover:bg-white/5'}`}>
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Portfolio</span>
          </button>
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 space-y-4">
          <button onClick={onLogout} className="w-full py-5 text-red-500/50 hover:text-red-500 text-[10px] uppercase font-black bg-red-500/5 rounded-2xl transition-all flex items-center justify-center space-x-3">
            <LogOut className="w-4 h-4" /> 
            <span>Terminate Session</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 md:p-14 overflow-y-auto max-h-screen bg-[#050505] custom-scrollbar">
        <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-16 gap-8">
          <h1 className="text-5xl md:text-6xl font-serif italic leading-none">{activeTab === 'orders' ? 'Inbound Orders' : 'Gallery Studio'}</h1>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
            <input 
              type="text" 
              placeholder="Search by title or name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-sm outline-none focus:border-[#d4af37] transition-all placeholder:text-gray-800" 
            />
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-14 items-start">
            {/* Order List */}
            <div className="xl:col-span-5 space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
              {filteredOrders.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                  <AlertCircle className="w-12 h-12 text-gray-800 mx-auto mb-6" />
                  <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">No matching records found</p>
                </div>
              )}
              {filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)} 
                  className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative group ${selectedOrder?.id === order.id ? 'bg-neutral-900 border-[#d4af37] shadow-[0_20px_40px_rgba(0,0,0,0.5)]' : 'bg-neutral-900/30 border-white/5 hover:border-white/20'}`}
                >
                  {order.status === OrderStatus.New && (
                    <div className="absolute top-8 right-8 w-2 h-2 bg-[#d4af37] rounded-full shadow-[0_0_10px_#d4af37]"></div>
                  )}
                  <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest block mb-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <h4 className="font-bold text-2xl mb-3 pr-8 leading-tight">{order.projectTitle}</h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] text-gray-500 uppercase font-black">{order.name}</span>
                    <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                    <span className={`text-[10px] uppercase font-black ${order.status === OrderStatus.Completed ? 'text-green-500' : 'text-[#d4af37]'}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Order View */}
            <div className="xl:col-span-7">
              {selectedOrder ? (
                <div className="bg-neutral-900 border border-white/10 rounded-[3rem] p-10 md:p-14 animate-fadeIn shadow-2xl space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-10">
                    <div>
                       <span className="text-[#d4af37] uppercase text-[10px] font-black tracking-[0.4em] block mb-2">Project Dossier</span>
                       <h3 className="text-4xl md:text-5xl font-serif italic leading-tight">{selectedOrder.projectTitle}</h3>
                    </div>
                    <div className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${selectedOrder.status === OrderStatus.Completed ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'}`}>
                      {selectedOrder.status}
                    </div>
                  </div>

                  {/* Client Identity Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 mb-2">
                       <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/20">
                          <User className="w-4 h-4 text-[#d4af37]" />
                       </div>
                       <h5 className="text-xs uppercase font-black tracking-widest text-gray-500">Client Profile</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                      <div className="space-y-2">
                        <span className="text-gray-600 uppercase text-[9px] font-black block tracking-widest">Client Name</span>
                        <p className="text-xl font-bold">{selectedOrder.name}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-gray-600 uppercase text-[9px] font-black block tracking-widest">Brand / Company</span>
                        <p className="text-lg font-bold text-gray-300">{selectedOrder.companyName || 'Private Request'}</p>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <span className="text-gray-600 uppercase text-[9px] font-black block tracking-widest">WhatsApp Contact</span>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-black text-[#d4af37]">{selectedOrder.whatsapp}</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => copyToClipboard(selectedOrder.whatsapp, 'WhatsApp Number')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all" title="Copy Number">
                              <Copy className="w-4 h-4 text-gray-500" />
                            </button>
                            <a href={`https://wa.me/${selectedOrder.whatsapp.replace(/\D/g,'')}`} target="_blank" className="p-2.5 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all" title="Start Chat">
                              <Smartphone className="w-4 h-4 text-green-500" />
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <span className="text-gray-600 uppercase text-[9px] font-black block tracking-widest">Email Address</span>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold truncate max-w-[200px]">{selectedOrder.email || 'N/A'}</p>
                          {selectedOrder.email && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => copyToClipboard(selectedOrder.email, 'Email Address')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                <Copy className="w-4 h-4 text-gray-500" />
                              </button>
                              <a href={`mailto:${selectedOrder.email}`} className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all">
                                <Mail className="w-4 h-4 text-blue-400" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Technical Scope */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 mb-2">
                       <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/20">
                          <Hash className="w-4 h-4 text-[#d4af37]" />
                       </div>
                       <h5 className="text-xs uppercase font-black tracking-widest text-gray-500">Project Parameters</h5>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                      <div className="space-y-1">
                        <span className="text-gray-600 uppercase text-[9px] font-black block tracking-widest">Discipline</span>
                        <p className="text-sm font-bold">{selectedOrder.category}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-600 uppercase text-[9px] font-black block tracking-widest">Type</span>
                        <p className="text-sm font-bold">{selectedOrder.subCategory}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-600 uppercase text-[9px] font-black block tracking-widest">Dimensions</span>
                        <p className="text-sm font-bold">{selectedOrder.preferredSize || 'Any'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-600 uppercase text-[9px] font-black block tracking-widest text-[#d4af37]">Deadline</span>
                        <p className="text-sm font-black flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> {selectedOrder.deadline || 'ASAP'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Creative Directive / Detailed Brief */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 mb-2">
                       <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/20">
                          <Edit3 className="w-4 h-4 text-[#d4af37]" />
                       </div>
                       <h5 className="text-xs uppercase font-black tracking-widest text-gray-500">Creative Directive</h5>
                    </div>
                    <div className="p-10 bg-black/80 rounded-[3rem] border border-white/5 shadow-2xl text-lg text-gray-200 leading-[1.8] font-light">
                      <p className="mb-6 border-b border-white/5 pb-6">"{selectedOrder.details}"</p>
                      <div className="flex items-center gap-4 mt-8 pt-4 border-t border-white/5 opacity-50">
                        <span className="text-[10px] uppercase font-black tracking-[0.4em]">DesignGold Secure Data Node</span>
                      </div>
                    </div>
                  </div>

                  {/* Reference Asset Viewer */}
                  {selectedOrder.referenceFile && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                           <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/20">
                              <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                           </div>
                           <h5 className="text-xs uppercase font-black tracking-widest text-gray-500">Reference Visual</h5>
                        </div>
                        <button onClick={() => setFullImagePreview(selectedOrder.referenceFile!)} className="text-[10px] font-black uppercase text-[#d4af37] flex items-center gap-2 hover:text-white transition-colors">
                           <ExternalLink className="w-4 h-4" /> View HD Original
                        </button>
                      </div>
                      
                      <div 
                        className="relative group rounded-[3rem] overflow-hidden border border-white/10 bg-black aspect-video cursor-zoom-in shadow-2xl hover:border-[#d4af37]/30 transition-all duration-700"
                        onClick={() => setFullImagePreview(selectedOrder.referenceFile!)}
                      >
                        <img 
                          src={selectedOrder.referenceFile} 
                          className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-[2s]" 
                          alt="Client Reference Asset" 
                        />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center space-y-6 backdrop-blur-sm">
                          <div className="w-20 h-20 bg-[#d4af37] text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.4)]">
                            <Eye className="w-10 h-10" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-[0.5em] text-white">Click to Inspect in High Definition</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operational Controls */}
                  <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-white/5">
                    {selectedOrder.status !== OrderStatus.Completed && (
                      <button 
                        onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.InProgress)} 
                        className="flex-1 py-7 bg-white/5 border border-white/10 text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all"
                      >
                        Initialize Workflow
                      </button>
                    )}
                    <button 
                      onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Completed)} 
                      className={`flex-1 py-7 font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl transition-all shadow-[0_15px_30px_rgba(0,0,0,0.4)] ${selectedOrder.status === OrderStatus.Completed ? 'bg-green-500/10 text-green-500 border border-green-500/20 pointer-events-none' : 'bg-[#d4af37] text-black hover:bg-white'}`}
                    >
                      {selectedOrder.status === OrderStatus.Completed ? 'Project Successfully Closed' : 'Finalize & Archive'}
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(selectedOrder.id)} 
                      className="p-7 bg-red-500/5 text-red-500/50 border border-red-500/10 rounded-2xl hover:bg-red-500 hover:text-white transition-all group"
                      title="Permanently Delete"
                    >
                      <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[70vh] flex flex-col items-center justify-center p-20 text-center space-y-10 animate-fadeIn bg-neutral-900/10 border border-dashed border-white/5 rounded-[4rem]">
                   <div className="w-40 h-40 bg-white/2 rounded-full flex items-center justify-center border border-white/5 relative">
                      <div className="absolute inset-0 border border-[#d4af37]/20 rounded-full animate-ping opacity-20"></div>
                      <div className="absolute inset-4 border border-white/10 rounded-full"></div>
                      <Package className="w-16 h-16 text-gray-800" />
                   </div>
                   <div className="space-y-4">
                     <h3 className="text-4xl font-serif italic">Operational Overview</h3>
                     <p className="text-[11px] text-gray-600 uppercase font-black tracking-[0.5em] max-w-sm mx-auto leading-loose">Select a project record to decrypt client specifications and analyze attached visual assets</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
             <button onClick={() => setIsModalOpen(true)} className="aspect-[4/5] border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center hover:border-[#d4af37] transition-all group bg-white/2 hover:bg-[#d4af37]/5">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-black transition-all mb-6">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 group-hover:text-white">Publish Work</span>
             </button>
             {filteredProjects.map(p => (
               <div key={p.id} className="bg-neutral-900 rounded-[3rem] overflow-hidden border border-white/5 relative group aspect-[4/5] shadow-2xl">
                 <img src={p.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt={p.title} />
                 <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                   <h4 className="font-bold text-2xl mb-1">{p.title}</h4>
                   <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-black mb-6">{p.category}</p>
                   <button onClick={() => portfolioService.deleteProject(p.id)} className="absolute top-8 right-8 p-4 bg-red-600/90 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl backdrop-blur-md">
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-12 md:p-16 animate-modalPop shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
            <h3 className="text-4xl font-serif italic mb-10 gold-text">Archive New Asset</h3>
            <form onSubmit={handleProjectSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-2">Project Label</label>
                <input required type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-[#d4af37] transition-all text-sm" placeholder="e.g. Neo-Branding Identity" />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-2">Creative Discipline</label>
                <select value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value as Category})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-[#d4af37] transition-all text-sm appearance-none">
                  {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-2">Asset Source</label>
                <div className="relative w-full py-20 bg-black border border-white/10 rounded-[2rem] flex flex-col items-center justify-center space-y-4 cursor-pointer hover:border-[#d4af37] group transition-all">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#d4af37]/10 transition-colors">
                    <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-[#d4af37]" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                    {projectForm.imageUrl ? 'Master File Synced' : 'Select Raw Asset'}
                  </span>
                  <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setProjectForm({...projectForm, imageUrl: reader.result as string});
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              </div>

              <button type="submit" className="w-full py-7 bg-[#d4af37] text-black font-black uppercase text-xs tracking-[0.4em] rounded-2xl hover:bg-white transition-all shadow-2xl">
                Publish to Studio Gallery
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
