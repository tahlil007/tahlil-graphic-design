
import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import { portfolioService } from '../services/portfolioService';
import { OrderData, OrderStatus, Category, Project } from '../types';
import { SUB_CATEGORIES } from '../constants';
import { 
  Crown, LogOut, Package, Clock, CheckCircle, 
  Trash2, MessageCircle, Mail, ExternalLink,
  Search, User, ArrowLeft,
  Bell, BellRing, ArrowUpDown, Calendar, LayoutGrid,
  Check, Eye, ShieldCheck, Plus, Image as ImageIcon,
  FolderOpen, X, Upload, Download, Briefcase, Edit3, Settings2, Filter, AlertCircle, FileWarning, Send
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type SortBy = 'date' | 'category' | 'status';
type Tab = 'orders' | 'portfolio';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All' | 'Unread'>('All');
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  
  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  
  // Portfolio Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [projectForm, setProjectForm] = useState<Omit<Project, 'id'>>({
    title: '',
    category: Category.Logo,
    subCategory: SUB_CATEGORIES[Category.Logo][0],
    description: '',
    imageUrl: ''
  });

  // Effect to load data and listen for external updates
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshOrdersOnly, 5000);
    
    // This listener handles updates triggered from the service
    const handleUpdate = () => refreshData();
    window.addEventListener('portfolioUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('portfolioUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
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
      const unreadOrders = fetchedOrders.filter(o => !o.read);
      if (unreadOrders.length > 0) {
        showFeedback("New client order received!", "success");
      }
    }
    setLastOrderCount(fetchedOrders.length);
    setOrders(fetchedOrders);
  };

  const notifyPortfolioUpdate = () => {
    window.dispatchEvent(new Event('portfolioUpdated'));
  };

  // Order Handlers
  const handleStatusChange = (id: string, status: OrderStatus) => {
    orderService.updateOrderStatus(id, status);
    refreshData();
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
    showFeedback(`Order status updated to ${status}`);
  };

  const handleMarkAsRead = (id: string) => {
    orderService.markAsRead(id);
    refreshData();
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, read: true } : null);
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to permanently delete this order record?')) {
      try {
        orderService.deleteOrder(id);
        refreshData();
        setSelectedOrder(null);
        showFeedback("Order record deleted successfully", "success");
      } catch (err) {
        showFeedback("Error deleting order record", "error");
      }
    }
  };

  // Portfolio Handlers
  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setProjectForm({ 
      title: '', 
      category: Category.Logo, 
      subCategory: SUB_CATEGORIES[Category.Logo][0], 
      description: '', 
      imageUrl: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setIsEditing(true);
    setEditingId(project.id);
    setProjectForm({
      title: project.title,
      category: project.category,
      subCategory: project.subCategory || SUB_CATEGORIES[project.category][0],
      description: project.description,
      imageUrl: project.imageUrl
    });
    setIsModalOpen(true);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.imageUrl) {
      return showFeedback('Project Title and Image are required.', 'error');
    }
    
    try {
      if (isEditing && editingId) {
        portfolioService.updateProject(editingId, projectForm);
        showFeedback("Portfolio updated successfully", "success");
      } else {
        portfolioService.addProject(projectForm);
        showFeedback("Portfolio added successfully", "success");
      }

      refreshData();
      notifyPortfolioUpdate();
      setIsModalOpen(false);
    } catch (err: any) {
      showFeedback(err.message || "Failed to save project", "error");
    }
  };

  const handleDeleteProject = (id: string) => {
    if (!id) return;
    
    // Explicit confirmation dialog in Bengali as requested
    const confirmed = window.confirm("আপনি কি নিশ্চিতভাবে এই Portfolio item মুছে ফেলতে চান?");
    
    if (confirmed) {
      try {
        // Step 1: Delete from service (localStorage)
        portfolioService.deleteProject(id);
        
        // Step 2: Immediate UI State update (Instant Removal)
        setProjects(current => current.filter(p => String(p.id) !== String(id)));
        
        // Step 3: Global Notification
        notifyPortfolioUpdate();
        
        // Step 4: Success Message in Bengali
        showFeedback("Portfolio item সফলভাবে মুছে ফেলা হয়েছে", "success");
      } catch (err: any) {
        console.error("Deletion failed:", err);
        showFeedback("Failed to delete portfolio item", "error");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return showFeedback("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.", "error");
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return showFeedback("File too large. Maximum size is 5MB.", "error");
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProjectForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
      showFeedback("Image uploaded successfully");
    };
    reader.onerror = () => {
      setIsUploading(false);
      showFeedback("Failed to read image file.", "error");
    };
    reader.readAsDataURL(file);
  };

  // Memoized Filters
  const filteredAndSortedOrders = useMemo(() => {
    let result = orders.filter(o => {
      let statusMatch = true;
      if (filterStatus === 'Unread') statusMatch = !o.read;
      else if (filterStatus !== 'All') statusMatch = o.status === filterStatus;
      const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            o.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && matchesSearch;
    });
    result.sort((a, b) => {
      if (sortBy === 'date') return b.createdAt - a.createdAt;
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });
    return result;
  }, [orders, filterStatus, searchQuery, sortBy]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const categoryMatch = portfolioCategoryFilter === 'All' || p.category === portfolioCategoryFilter;
      const searchMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.subCategory?.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [projects, portfolioCategoryFilter, searchQuery]);

  const stats = {
    total: orders.length,
    unread: orders.filter(o => !o.read).length,
    portfolioCount: projects.length,
    itemsByCategory: Object.values(Category).reduce((acc, cat) => {
      acc[cat] = projects.filter(p => p.category === cat).length;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row relative overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[200] animate-slideDown">
          <div className={`${notification.type === 'success' ? 'bg-[#d4af37]' : 'bg-red-500'} text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-white/10`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-bold">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 bg-black border-r border-white/5 p-8 flex flex-col z-10 shrink-0">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 text-gray-500 hover:text-[#d4af37] transition-all mb-12 group"
        >
          <div className="p-2 rounded-full border border-white/10 group-hover:border-[#d4af37] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Studio</span>
        </button>

        <div className="flex items-center space-x-3 mb-12">
          <div className="relative">
            <Crown className="w-10 h-10 text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
          </div>
          <div>
            <span className="font-serif italic gold-text text-2xl block leading-none">Admin Panel</span>
            <span className="text-[7px] uppercase tracking-[0.3em] text-gray-600 font-black">Authorized Only</span>
          </div>
        </div>

        <nav className="space-y-1 mb-10">
          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-black mb-4 px-4">Workspace</p>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#d4af37] text-black font-bold shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-widest">Client Orders</span>
            </div>
            {stats.unread > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-[10px] font-black">
                {stats.unread}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-[#d4af37] text-black font-bold shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <div className="flex items-center space-x-3">
              <ImageIcon className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-widest">Gallery Control</span>
            </div>
            <span className="text-[10px] opacity-100 font-black px-2 bg-white/10 rounded-md">{stats.portfolioCount}</span>
          </button>
        </nav>

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
             <p className="text-[9px] uppercase tracking-widest text-gray-600 font-black px-4">Portfolio Filters</p>
             <div className="space-y-1">
               {['All', ...Object.values(Category)].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setPortfolioCategoryFilter(cat as any)}
                   className={`w-full text-left px-4 py-2 text-[9px] uppercase tracking-widest font-black transition-all rounded-lg ${portfolioCategoryFilter === cat ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                   <div className="flex items-center justify-between">
                     <span>{cat}</span>
                     <span className="opacity-40">{cat === 'All' ? stats.portfolioCount : stats.itemsByCategory[cat] || 0}</span>
                   </div>
                 </button>
               ))}
             </div>
          </div>
        )}

        <div className="mt-auto pt-8 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-red-500/50 hover:text-red-500 transition-all text-[10px] uppercase tracking-widest font-black bg-red-500/5 rounded-xl border border-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen custom-scrollbar bg-[#050505]">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-serif italic mb-2 tracking-tight">
              {activeTab === 'orders' ? 'Engagement Pipeline' : 'Portfolio Studio'}
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black">
              TH Creative Studio Logistics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 min-w-[240px] md:min-w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700 shadow-2xl"
              />
            </div>

            {activeTab === 'portfolio' && (
              <button 
                onClick={openAddModal}
                className="px-8 py-4 bg-[#d4af37] text-black rounded-2xl flex items-center space-x-3 hover:bg-white hover:scale-105 transition-all shadow-2xl font-black uppercase tracking-widest text-[10px]"
              >
                <Plus className="w-5 h-5" />
                <span>Publish New Project</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8 animate-fadeIn">
              {filteredAndSortedOrders.length === 0 ? (
                <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
                   <FolderOpen className="w-16 h-16 text-neutral-800 mx-auto mb-4 opacity-20" />
                   <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">No order matches found</p>
                </div>
              ) : (
                filteredAndSortedOrders.map(order => (
                  <div 
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      if (!order.read) handleMarkAsRead(order.id);
                    }}
                    className={`p-10 rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden ${selectedOrder?.id === order.id ? 'bg-neutral-900 border-[#d4af37] shadow-2xl' : 'bg-neutral-900/40 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-2xl group-hover:text-[#d4af37] transition-colors">{order.projectTitle}</h4>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        order.status === OrderStatus.New ? 'border-blue-500/20 text-blue-500' :
                        order.status === OrderStatus.InProgress ? 'border-yellow-500/20 text-yellow-500' :
                        'border-green-500/20 text-green-500'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-6">{order.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                    {!order.read && <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-bl-xl shadow-[0_0_10px_rgba(255,165,0,0.5)]"></span>}
                  </div>
                ))
              )}
            </div>

            {selectedOrder ? (
              <div className="bg-neutral-900 border border-white/10 rounded-[3rem] p-12 sticky top-10 animate-fadeIn shadow-2xl overflow-hidden">
                <div className="flex justify-between items-start mb-12">
                   <h3 className="text-3xl font-serif italic tracking-tight">{selectedOrder.projectTitle}</h3>
                   <button 
                     type="button"
                     onClick={(e) => {
                       e.stopPropagation();
                       handleDeleteOrder(selectedOrder.id);
                     }} 
                     className="w-16 h-16 flex items-center justify-center bg-red-500/10 border-2 border-white rounded-[1.5rem] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl group"
                   >
                     <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                   </button>
                </div>
                
                <div className="space-y-8 mb-12">
                   <div className="p-10 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-6">
                      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                         <span className="text-gray-600">Client</span>
                         <span className="text-white">{selectedOrder.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                         <span className="text-gray-600">Category</span>
                         <span className="text-[#d4af37]">{selectedOrder.subCategory}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                         <span className="text-gray-600">WhatsApp</span>
                         <span className="text-green-500 font-bold">{selectedOrder.whatsapp}</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                     <p className="text-[10px] uppercase tracking-widest text-gray-600 font-black ml-1">Project Brief Narrative</p>
                     <div className="p-8 bg-black/40 rounded-3xl border border-white/5 italic text-sm text-gray-300 leading-relaxed">
                       "{selectedOrder.details}"
                     </div>
                   </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-white/5">
                   <div className="grid grid-cols-3 gap-4">
                      {[OrderStatus.New, OrderStatus.InProgress, OrderStatus.Completed].map(status => (
                        <button 
                          key={status}
                          onClick={() => handleStatusChange(selectedOrder.id, status)}
                          className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedOrder.status === status ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-lg' : 'bg-black/40 text-gray-600 border-white/5 hover:border-white/20'}`}
                        >
                          {status}
                        </button>
                      ))}
                   </div>
                   <a 
                     href={`https://wa.me/${selectedOrder.whatsapp.replace(/\D/g, '')}`} 
                     target="_blank"
                     className="block w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] text-center hover:bg-green-500 transition-all shadow-xl"
                   >
                     Initiate WhatsApp Negotiation
                   </a>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center h-full opacity-10 text-center">
                <Briefcase className="w-24 h-24 mb-6 mx-auto" />
                <h3 className="font-serif italic text-3xl mb-3 text-white">Select Order Record</h3>
                <p className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-500">Logistics stream awaiting selection</p>
              </div>
            )}
          </div>
        ) : (
          /* Portfolio Studio Interface - Enhanced Add/Edit/Delete */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fadeIn">
            {filteredProjects.map(project => (
              <div 
                key={project.id} 
                className="group bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-[#d4af37]/50 transition-all duration-500 shadow-2xl relative"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                  
                  {/* Action Buttons - Fixed styling for reliability and high visibility */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-[50]">
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        openEditModal(project); 
                      }}
                      className="p-4 bg-white text-black rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-transparent hover:border-black"
                      title="Edit Portfolio Item"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        handleDeleteProject(project.id); 
                      }}
                      className="p-4 bg-red-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-white"
                      title="Delete Portfolio Item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 pointer-events-none"></div>
                  
                  <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                     <span className="w-fit px-3 py-1 bg-[#d4af37] backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-black mb-2 block border border-black/10">
                       {project.category}
                     </span>
                     <h4 className="font-bold text-xl leading-tight text-white group-hover:text-[#d4af37] transition-colors">{project.title}</h4>
                     <p className="text-[9px] uppercase tracking-widest font-black text-gray-500 mt-2 opacity-60">{project.subCategory}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Publication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-lg animate-fadeIn" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-12 animate-modalPop shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 z-10 bg-[#0f0f0f]/90 backdrop-blur-md pb-6 flex justify-between items-center mb-4">
              <div>
                <h3 className="text-4xl font-serif italic mb-2 tracking-tight">{isEditing ? 'Modify Asset' : 'New Brand Asset'}</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">TH Creative Studio Registry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-8 h-8 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-gray-600 font-black ml-1">Asset Title *</label>
                  <input 
                    required 
                    type="text" 
                    value={projectForm.title} 
                    onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-800" 
                    placeholder="Project Name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-gray-600 font-black ml-1">Core Discipline *</label>
                  <select 
                    value={projectForm.category}
                    onChange={e => {
                      const cat = e.target.value as Category;
                      setProjectForm({...projectForm, category: cat, subCategory: SUB_CATEGORIES[cat][0]});
                    }}
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] outline-none cursor-pointer text-sm"
                  >
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-gray-600 font-black ml-1">Subcategory Type</label>
                  <select 
                    value={projectForm.subCategory}
                    onChange={e => setProjectForm({...projectForm, subCategory: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] outline-none cursor-pointer text-sm"
                  >
                    {SUB_CATEGORIES[projectForm.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-gray-600 font-black ml-1">Stylistic Context</label>
                  <input 
                    type="text" 
                    value={projectForm.description}
                    onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-800" 
                    placeholder="Brief description (optional)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-600 font-black ml-1">Visual Asset (Image) *</label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-48 h-48 group relative border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all overflow-hidden shrink-0">
                    {isUploading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[8px] uppercase tracking-widest font-black text-[#d4af37]">Processing</span>
                      </div>
                    ) : projectForm.imageUrl ? (
                      <img src={projectForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-700 mb-3 group-hover:text-[#d4af37] transition-colors" />
                        <span className="text-[8px] uppercase tracking-[0.3em] font-black text-gray-700">Browse Files</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                  <div className="flex-1 w-full space-y-4 pt-2">
                     <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start space-x-3">
                        <FileWarning className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">Accepted: JPG, PNG, GIF, WEBP.<br/>Max Size: 5MB per asset.</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] uppercase font-black text-gray-700">Or External Image URL</p>
                        <input 
                          type="text" 
                          value={projectForm.imageUrl}
                          onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})}
                          className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-xs focus:border-[#d4af37] outline-none placeholder:text-gray-800" 
                          placeholder="https://images.unsplash.com/..."
                        />
                     </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUploading}
                className="w-full py-7 bg-[#d4af37] text-black font-black uppercase tracking-[0.4em] text-xs rounded-[1.5rem] shadow-xl hover:bg-white hover:scale-[1.01] transition-all mt-6 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-4"
              >
                {isUploading ? (
                   <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                   <Send className="w-5 h-5" />
                )}
                <span>{isEditing ? 'SAVE MODIFICATIONS NOW' : 'PUBLISH NEW ASSET'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
