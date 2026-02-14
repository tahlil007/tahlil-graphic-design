
import React, { useState, useMemo, useEffect } from 'react';
import { Category, OrderData, OrderStatus } from '../types.ts';
import { SUB_CATEGORIES } from '../constants.ts';
import { orderService } from '../services/orderService.ts';
import { Send, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, MessageCircle, Upload, Briefcase, User, PenTool, CheckCircle, X, File } from 'lucide-react';
import { getProjectBriefSuggestions } from '../services/geminiService.ts';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<OrderData, 'id' | 'createdAt' | 'status' | 'read'>>({
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiBrief, setAiBrief] = useState<string | null>(null);
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
    const promptContext = `${formData.category} - ${formData.subCategory} for ${formData.projectTitle}`;
    const brief = await getProjectBriefSuggestions(promptContext);
    setAiBrief(brief || "Could not generate suggestions. Please describe your project vision.");
    setIsLoadingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      alert("Please agree to the Terms & Conditions.");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      // Note: Data is saved to localStorage (browser-specific)
      orderService.saveOrder(formData);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const generateWhatsAppUrl = () => {
    const adminPhone = "YOUR_WHATSAPP_NUMBER_HERE"; // Replace with your actual WhatsApp number
    const message = `*NEW ORDER RECEIVED - DESIGNGOLD*%0A%0A` +
      `*Client Info:*%0A` +
      `- Name: ${formData.name}%0A` +
      `- Email: ${formData.email}%0A` +
      `- WhatsApp: ${formData.whatsapp}%0A` +
      `- Brand: ${formData.companyName || 'N/A'}%0A%0A` +
      `*Project Info:*%0A` +
      `- Title: ${formData.projectTitle}%0A` +
      `- Service: ${formData.category} (${formData.subCategory})%0A` +
      `- Deadline: ${formData.deadline}%0A` +
      `- Budget: ${formData.budgetRange || 'Flexible'}%0A%0A` +
      `*Project Brief:*%0A${formData.details}%0A%0A` +
      `*Design Specs:*%0A` +
      `- Size: ${formData.preferredSize || 'Standard'}%0A` +
      `- Colors: ${formData.colorPreference || 'Open'}%0A` +
      `- Content: ${formData.textContent || 'See attachments'}`;
    
    return `https://wa.me/your_number_here?text=${message}`; // Replace with your number in format: 88017XXXXXXXX
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.whatsapp)) return alert("Please fill all required fields in Step 1.");
    if (step === 2 && (!formData.projectTitle || !formData.details || !formData.deadline)) return alert("Please fill all required fields in Step 2.");
    setStep(s => Math.min(s + 1, 4));
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (!isOpen) return null;

  const stepsInfo = [
    { title: 'Client Info', icon: User },
    { title: 'Project Info', icon: Briefcase },
    { title: 'Design Details', icon: PenTool },
    { title: 'Final Actions', icon: CheckCircle },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f0f0f] border border-white/10 rounded-[2rem] shadow-2xl custom-scrollbar animate-modalPop">
        <div className="sticky top-0 z-20 flex justify-between items-center p-8 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-white/5">
          <div>
            <h4 className="text-[#d4af37] uppercase tracking-[0.4em] text-[10px] font-black mb-1">Commission Request</h4>
            <h3 className="text-2xl font-serif italic">Launch Your Project</h3>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500 hover:text-white" />
          </button>
        </div>

        <div className="p-8 md:p-12">
          {!isSuccess && (
            <div className="flex justify-between items-center relative max-w-lg mx-auto mb-16">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-neutral-800 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-[2px] bg-[#d4af37] -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / (stepsInfo.length - 1)) * 100}%` }}
              ></div>
              
              {stepsInfo.map((s, i) => {
                const Icon = s.icon;
                const isActive = step >= i + 1;
                const isCurrent = step === i + 1;
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isCurrent ? 'bg-black border-[#d4af37] text-[#d4af37] scale-110 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 
                      isActive ? 'bg-[#d4af37] border-[#d4af37] text-black' : 
                      'bg-neutral-900 border-neutral-800 text-neutral-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`absolute -bottom-6 text-[8px] uppercase tracking-widest font-black whitespace-nowrap transition-colors ${isActive ? 'text-[#d4af37]' : 'text-neutral-600'}`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-10 animate-fadeIn">
              <div className="w-24 h-24 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-[#d4af37]" />
              </div>
              <h4 className="text-3xl font-serif italic mb-4">অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!</h4>
              <p className="text-gray-400 mb-10 max-w-sm mx-auto leading-relaxed text-sm">
                আপনার অর্ডারের বিস্তারিত এখন আমাদের WhatsApp-এ পাঠিয়ে দিন যাতে আমরা সাথে সাথে কাজ শুরু করতে পারি।
              </p>
              
              <div className="space-y-4 max-w-md mx-auto">
                <a 
                  href={generateWhatsAppUrl()} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-6 bg-green-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center space-x-4 hover:bg-green-500 hover:scale-[1.02] transition-all shadow-[0_20px_40px_rgba(22,163,74,0.3)]"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>Notify via WhatsApp (Admin)</span>
                </a>
                
                <button 
                  onClick={onClose}
                  className="w-full py-4 text-gray-500 text-[10px] uppercase font-black tracking-widest hover:text-white transition-colors"
                >
                  Close & Return to Site
                </button>
              </div>
              
              <p className="mt-8 text-[9px] text-gray-600 uppercase tracking-widest leading-relaxed">
                Note: Local data saved successfully. <br/> Cross-device sync requires WhatsApp notification.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Full Name *</label>
                    <input required name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Email Address *</label>
                    <input required name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">WhatsApp Number *</label>
                    <input required name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" placeholder="+880..." />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Company/Brand Name (Optional)</label>
                    <input name="companyName" type="text" value={formData.companyName} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" placeholder="Your Brand Name" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Design Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none cursor-pointer">
                        {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Subcategory</label>
                      <select name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none cursor-pointer">
                        {subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Project Title *</label>
                    <input required name="projectTitle" type="text" value={formData.projectTitle} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" placeholder="e.g. Modern Branding for Tech Startup" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Deadline *</label>
                      <input required name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Budget Range (Optional)</label>
                      <input name="budgetRange" type="text" value={formData.budgetRange} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" placeholder="e.g. $200 - $500" />
                    </div>
                  </div>
                  <div className="space-y-3 relative">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Project Description *</label>
                      <button type="button" onClick={handleAiHelp} disabled={isLoadingAi} className="text-[8px] font-black tracking-widest text-[#d4af37] flex items-center space-x-2">
                        <Sparkles className={`w-3 h-3 ${isLoadingAi ? 'animate-spin' : ''}`} />
                        <span>{isLoadingAi ? 'THINKING...' : 'AI ASSISTANT'}</span>
                      </button>
                    </div>
                    <textarea required name="details" value={formData.details} onChange={handleInputChange} rows={3} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none resize-none" placeholder="Describe your requirements..." />
                    {aiBrief && (
                      <div className="mt-3 p-4 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-2xl text-[11px] text-gray-400 italic">
                        {aiBrief}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Preferred Size</label>
                      <input name="preferredSize" type="text" value={formData.preferredSize} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" placeholder="e.g. A4, 1080x1080px" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Color Preference</label>
                      <input name="colorPreference" type="text" value={formData.colorPreference} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none" placeholder="e.g. Gold, Black" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">Text Content</label>
                    <textarea name="textContent" value={formData.textContent} onChange={handleInputChange} rows={3} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 focus:border-[#d4af37] transition-all outline-none resize-none" placeholder="Enter all info to be included..." />
                  </div>
                  <div className="group relative p-10 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-3 hover:border-[#d4af37] transition-all cursor-pointer bg-white/2">
                    {formData.referenceFile ? (
                      <div className="flex flex-col items-center space-y-2">
                        <File className="w-8 h-8 text-[#d4af37]" />
                        <span className="text-xs font-bold text-white">File Uploaded</span>
                        <button type="button" onClick={() => setFormData(p => ({...p, referenceFile: undefined}))} className="text-[10px] text-red-500 underline">Remove</button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-500 group-hover:text-[#d4af37]" />
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest font-black mb-1">Upload Reference</p>
                          <p className="text-[9px] text-gray-600">Drag or click to browse</p>
                        </div>
                      </>
                    )}
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-10 animate-fadeIn">
                  <div className="bg-black p-6 rounded-2xl border border-white/5">
                    <h5 className="font-serif italic text-xl mb-4">Summary Review</h5>
                    <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-wider">
                      <div><span className="text-gray-600">Client:</span> {formData.name}</div>
                      <div><span className="text-gray-600">Service:</span> {formData.subCategory}</div>
                      <div className="col-span-2"><span className="text-gray-600">Project:</span> {formData.projectTitle}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="agreedToTerms" 
                      id="terms"
                      checked={formData.agreedToTerms} 
                      onChange={handleInputChange} 
                      className="mt-1 w-5 h-5 rounded border-2 border-white/10 bg-black checked:bg-[#d4af37] cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-[10px] text-gray-500 leading-relaxed cursor-pointer group-hover:text-gray-300 transition-colors">
                      I confirm these details are accurate and I agree to the <span className="text-[#d4af37] underline underline-offset-4">Terms</span>.
                    </label>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button 
                      type="submit"
                      disabled={!formData.agreedToTerms || isSubmitting}
                      className="w-full py-6 bg-[#d4af37] text-black font-black uppercase tracking-[0.4em] text-xs rounded-2xl hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-20 shadow-[0_15px_35px_rgba(212,175,55,0.2)] flex items-center justify-center space-x-4"
                    >
                      {isSubmitting ? <Sparkles className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                      <span>{isSubmitting ? 'SENDING...' : 'PLACE ORDER'}</span>
                    </button>
                    <p className="text-center text-[8px] text-gray-600 uppercase tracking-widest font-black">
                      Note: You will be asked to send a WhatsApp message to finalize.
                    </p>
                  </div>
                </div>
              )}

              {!isSuccess && (
                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={prevStep} 
                    className={`flex items-center space-x-2 text-[10px] uppercase tracking-widest font-black ${step === 1 ? 'opacity-0' : 'text-gray-500 hover:text-white transition-colors'}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  {step < 4 && (
                    <button 
                      type="button" 
                      onClick={nextStep} 
                      className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-black text-[#d4af37] hover:text-white transition-colors"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
