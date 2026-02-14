
import React, { useState, useMemo, useEffect } from 'react';
import { Category, OrderData, OrderStatus } from '../types.ts';
import { SUB_CATEGORIES } from '../constants.ts';
import { orderService } from '../services/orderService.ts';
import { Send, Sparkles, CheckCircle2, ChevronRight, MessageCircle, Upload, X, ArrowLeft, LayoutGrid, Mail, User, Phone, Briefcase, PlusCircle } from 'lucide-react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => { if(isSuccess) resetForm(); onClose(); }}></div>
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl animate-modalPop custom-scrollbar">
        <div className="sticky top-0 z-20 flex justify-between items-center p-8 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5">
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
                আপনার অর্ডারটি সফলভাবে আমাদের সিস্টেমে জমা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-xl mx-auto">
                <button 
                  onClick={resetForm}
                  className="w-full sm:flex-1 py-5 bg-[#d4af37] text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl flex items-center justify-center space-x-3 hover:bg-white transition-all shadow-[0_15px_30px_rgba(212,175,55,0.2)]"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>নতুন অর্ডার করুন</span>
                </button>
                <button 
                  onClick={() => { onClose(); resetForm(); window.location.hash = '#portfolio'; }}
                  className="w-full sm:flex-1 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>গ্যালারি দেখুন</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Step Indicators */}
              <div className="flex items-center justify-between mb-12 max-w-md mx-auto">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s ? 'border-[#d4af37] bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-white/10 text-gray-500'}`}>
                      <span className="text-xs font-black">{s}</span>
                    </div>
                    {s < 4 && <div className={`w-8 h-0.5 mx-2 ${step > s ? 'bg-[#d4af37]' : 'bg-white/10'}`}></div>}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fadeIn">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black flex items-center gap-2 ml-2">
                      <User className="w-3 h-3" /> Full Name *
                    </label>
                    <input required name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] transition-all outline-none text-sm placeholder:text-gray-800" placeholder="e.g. Tahlil Ahmed" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black flex items-center gap-2 ml-2">
                      <Mail className="w-3 h-3" /> Email Address *
                    </label>
                    <input required name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] transition-all outline-none text-sm placeholder:text-gray-800" placeholder="e.g. info@company.com" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black flex items-center gap-2 ml-2">
                      <Phone className="w-3 h-3" /> WhatsApp Number *
                    </label>
                    <input required name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] transition-all outline-none text-sm placeholder:text-gray-800" placeholder="e.g. +88016xxxxxxxx" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black flex items-center gap-2 ml-2">
                      <Briefcase className="w-3 h-3" /> Company / Brand
                    </label>
                    <input name="companyName" type="text" value={formData.companyName} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] transition-all outline-none text-sm placeholder:text-gray-800" placeholder="Optional" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Service Discipline</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] outline-none text-sm appearance-none cursor-pointer">
                        {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Specific Type</label>
                      <select name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] outline-none text-sm appearance-none cursor-pointer">
                        {subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Project Subject *</label>
                    <input required name="projectTitle" type="text" value={formData.projectTitle} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] transition-all outline-none text-sm placeholder:text-gray-800" placeholder="e.g. Modern Minimalist Branding" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Detailed Design Brief *</label>
                       <button type="button" onClick={handleAiHelp} disabled={isLoadingAi} className="text-[9px] font-black text-[#d4af37] flex items-center space-x-2 bg-[#d4af37]/5 px-4 py-1.5 rounded-full hover:bg-[#d4af37]/10 transition-all disabled:opacity-50">
                         <Sparkles className={`w-3 h-3 ${isLoadingAi ? 'animate-spin' : ''}`} /> 
                         <span>{isLoadingAi ? 'GENERATING...' : 'AI BRIEFER'}</span>
                       </button>
                    </div>
                    <textarea required name="details" value={formData.details} onChange={handleInputChange} rows={5} className="w-full bg-black border border-white/10 rounded-3xl px-6 py-6 focus:border-[#d4af37] transition-all outline-none text-sm resize-none placeholder:text-gray-800 leading-relaxed" placeholder="Please describe your vision, colors, and expectations in detail..." />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10 animate-fadeIn">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Preferred Dimensions</label>
                      <input name="preferredSize" type="text" value={formData.preferredSize} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] transition-all outline-none text-sm placeholder:text-gray-800" placeholder="e.g. 1920x1080px or A4" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Delivery Deadline</label>
                      <input name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 focus:border-[#d4af37] transition-all outline-none text-sm text-gray-500" />
                    </div>
                  </div>
                  <div className="p-20 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center space-y-6 hover:border-[#d4af37] transition-all cursor-pointer bg-white/2 relative group">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center group-hover:bg-[#d4af37]/10 transition-colors">
                      <Upload className={`w-10 h-10 ${formData.referenceFile ? 'text-green-500' : 'text-gray-500'}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm uppercase font-black tracking-[0.2em] mb-2 ${formData.referenceFile ? 'text-green-500' : 'text-gray-400'}`}>
                        {formData.referenceFile ? 'Reference Synced' : 'Sync Reference Asset'}
                      </p>
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Supports High-Res JPG, PNG (Max 5MB)</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-12 animate-fadeIn max-w-2xl mx-auto">
                  <div className="text-center">
                    <h5 className="font-serif italic text-4xl mb-4 gold-text">Final Review</h5>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Please verify the integrity of your request data.</p>
                  </div>
                  
                  <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                    <div className="flex items-start space-x-6 cursor-pointer group">
                      <div className="relative mt-1">
                        <input type="checkbox" id="terms" checked={formData.agreedToTerms} onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})} className="w-7 h-7 border-2 border-[#d4af37] rounded-xl appearance-none checked:bg-[#d4af37] checked:border-[#d4af37] transition-all cursor-pointer shadow-lg" />
                        <CheckCircle2 className={`absolute top-1 left-1 w-5 h-5 text-black pointer-events-none transition-opacity ${formData.agreedToTerms ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      <label htmlFor="terms" className="text-[13px] text-gray-400 leading-relaxed cursor-pointer group-hover:text-white transition-colors">
                        I confirm that the design brief is accurate and I agree to initiate this creative commission under DesignGold terms.
                      </label>
                    </div>
                  </div>

                  <button type="submit" disabled={!formData.agreedToTerms || isSubmitting} className="w-full py-8 bg-[#d4af37] text-black font-black uppercase tracking-[0.4em] text-xs rounded-[2rem] hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-20 shadow-[0_20px_40px_rgba(212,175,55,0.2)]">
                    {isSubmitting ? 'ENCRYPTING & SENDING...' : 'TRANSMIT COMMISSION'}
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center pt-10 border-t border-white/5">
                <button type="button" onClick={prevStep} className={`flex items-center space-x-3 text-[10px] uppercase font-black tracking-widest ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:text-white transition-colors'}`}>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Previous</span>
                </button>
                {step < 4 && (
                  <button type="button" onClick={nextStep} className="flex items-center space-x-3 text-[10px] uppercase font-black tracking-widest text-[#d4af37] hover:text-white transition-colors">
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
