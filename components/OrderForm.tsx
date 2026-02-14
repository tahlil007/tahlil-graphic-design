
import React, { useState, useMemo, useEffect } from 'react';
import { Category, OrderData, OrderStatus } from '../types.ts';
import { SUB_CATEGORIES } from '../constants.ts';
import { orderService } from '../services/orderService.ts';
import { Send, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, MessageCircle, Upload, Briefcase, User, PenTool, CheckCircle, X, File, ArrowLeft, LayoutGrid } from 'lucide-react';
import { getProjectBriefSuggestions } from '../services/geminiService.ts';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose }) => {
  const initialFormData = {
    name: '',
    email: '',
    whatsapp: '',
    companyName: '',
    category: Category.Logo,
    subCategory: SUB_CATEGORIES[Category.Logo][0],
    projectTitle: '',
    details: '',
    deadline: '',
    budgetRange: '',
    preferredSize: '',
    colorPreference: '',
    textContent: '',
    referenceFile: undefined,
    agreedToTerms: false
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<OrderData, 'id' | 'createdAt' | 'status' | 'read'>>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const subCategories = useMemo(() => SUB_CATEGORIES[formData.category], [formData.category]);

  const resetForm = () => {
    setStep(1);
    setFormData(initialFormData);
    setIsSuccess(false);
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: val } as any;
      if (name === 'category') {
        newData.subCategory = SUB_CATEGORIES[value as Category][0];
      }
      return newData;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, referenceFile: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiHelp = async () => {
    if (!formData.projectTitle) {
      alert("Please provide a Project Title first so AI can help you better.");
      return;
    }
    setIsLoadingAi(true);
    const brief = await getProjectBriefSuggestions(`${formData.category} - ${formData.projectTitle}`);
    if (brief) {
      setFormData(prev => ({ ...prev, details: prev.details ? `${prev.details}\n\nAI Suggestions:\n${brief}` : brief }));
    }
    setIsLoadingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      orderService.saveOrder(formData);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleBackToOrder = () => {
    resetForm();
  };

  const handleViewPortfolio = () => {
    onClose();
    resetForm();
    window.location.hash = '#portfolio';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => { if(isSuccess) resetForm(); onClose(); }}></div>
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f0f0f] border border-white/10 rounded-[2rem] shadow-2xl animate-modalPop custom-scrollbar">
        <div className="sticky top-0 z-20 flex justify-between items-center p-8 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-white/5">
          <div>
            <h4 className="text-[#d4af37] uppercase tracking-[0.4em] text-[10px] font-black mb-1">Commission Request</h4>
            <h3 className="text-2xl font-serif italic">Launch Your Project</h3>
          </div>
          <button onClick={() => { if(isSuccess) resetForm(); onClose(); }} className="p-3 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500 hover:text-white" />
          </button>
        </div>

        <div className="p-8 md:p-12">
          {isSuccess ? (
            <div className="text-center py-10 animate-fadeIn">
              <div className="w-24 h-24 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                <CheckCircle2 className="w-12 h-12 text-[#d4af37]" />
              </div>
              <h4 className="text-4xl font-serif italic mb-6 gold-text">Order Confirmed!</h4>
              <p className="text-white text-xl md:text-2xl font-medium mb-12 max-w-xl mx-auto leading-relaxed">
                আমাদের প্রতিনিধি আপনার সাথে অতি দ্রুত যোগাযোগ করবে।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto">
                <button 
                  onClick={handleBackToOrder}
                  className="w-full sm:flex-1 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ব্যাক</span>
                </button>
                <button 
                  onClick={handleViewPortfolio}
                  className="w-full sm:flex-1 py-5 bg-[#d4af37] text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl flex items-center justify-center space-x-3 hover:bg-white transition-all shadow-[0_15px_30px_rgba(212,175,55,0.2)]"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>ভিউ পোর্টফোলিও</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Full Name *</label>
                    <input required name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">WhatsApp Number *</label>
                    <input required name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] outline-none">
                        {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Subcategory</label>
                      <select name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] outline-none">
                        {subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Project Title *</label>
                    <input required name="projectTitle" type="text" value={formData.projectTitle} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Project Details *</label>
                       <button type="button" onClick={handleAiHelp} disabled={isLoadingAi} className="text-[8px] font-black text-[#d4af37] flex items-center space-x-1 hover:text-white transition-colors disabled:opacity-50">
                         <Sparkles className={`w-3 h-3 ${isLoadingAi ? 'animate-spin' : ''}`} /> <span>{isLoadingAi ? 'GENERATING...' : 'AI HELP'}</span>
                       </button>
                    </div>
                    <textarea required name="details" value={formData.details} onChange={handleInputChange} rows={3} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none resize-none" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-fadeIn">
                   <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Preferred Size</label>
                      <input name="preferredSize" type="text" value={formData.preferredSize} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Deadline</label>
                      <input name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" />
                    </div>
                  </div>
                  <div className="p-10 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-3 hover:border-[#d4af37] transition-all cursor-pointer bg-white/2 relative">
                    <Upload className="w-6 h-6 text-gray-500" />
                    <p className="text-[10px] uppercase font-black tracking-widest">
                      {formData.referenceFile ? 'File Selected' : 'Upload Reference File'}
                    </p>
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-10 animate-fadeIn">
                  <div className="bg-black p-6 rounded-2xl border border-white/5">
                    <h5 className="font-serif italic text-xl mb-2">Final Review</h5>
                    <p className="text-[10px] text-gray-500 uppercase font-black">Please confirm your request details.</p>
                  </div>
                  <div className="flex items-start space-x-4 cursor-pointer">
                    <input type="checkbox" id="terms" checked={formData.agreedToTerms} onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})} className="mt-1 w-5 h-5 accent-[#d4af37]" />
                    <label htmlFor="terms" className="text-[10px] text-gray-500 leading-relaxed">I agree to the terms and conditions of this commission.</label>
                  </div>
                  <button type="submit" disabled={!formData.agreedToTerms || isSubmitting} className="w-full py-6 bg-[#d4af37] text-black font-black uppercase tracking-[0.4em] text-xs rounded-2xl hover:bg-white transition-all disabled:opacity-20 shadow-xl">
                    {isSubmitting ? 'PROCESSING...' : 'CONFIRM ORDER'}
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center pt-8 border-t border-white/5">
                <button type="button" onClick={prevStep} className={`text-[10px] uppercase font-black tracking-widest ${step === 1 ? 'opacity-0' : 'text-gray-500 hover:text-white'}`}>Back</button>
                {step < 4 && <button type="button" onClick={nextStep} className="text-[10px] uppercase font-black tracking-widest text-[#d4af37] hover:text-white">Next Step</button>}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
