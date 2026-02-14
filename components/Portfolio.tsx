
import React, { useState, useEffect } from 'react';
import { Category, Project } from '../types.ts';
import { portfolioService } from '../services/portfolioService.ts';
import { Plus, Search, ChevronRight } from 'lucide-react';

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const refreshPortfolio = () => {
    setProjects(portfolioService.getProjects());
  };

  useEffect(() => {
    refreshPortfolio();
    window.addEventListener('portfolioUpdated', refreshPortfolio);
    return () => window.removeEventListener('portfolioUpdated', refreshPortfolio);
  }, []);

  const categories = ['All', ...Object.values(Category)];
  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="portfolio" className="py-32 bg-[#050505]">
      <div className="container mx-auto px-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
          <div className="animate-fadeIn">
            <span className="text-[#d4af37] uppercase tracking-[0.6em] text-[10px] font-black block mb-4">Elite Archive</span>
            <h3 className="text-5xl md:text-8xl font-serif italic tracking-tighter leading-none">
              Strategic <br/>
              <span className="gold-text not-italic font-sans font-black">Creative Assets</span>
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2 animate-slideUp">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`px-7 py-3 text-[9px] uppercase tracking-widest font-black transition-all rounded-full border ${
                  activeCategory === cat 
                    ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-xl scale-105' 
                    : 'border-white/5 text-gray-600 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {filteredProjects.length === 0 ? (
          <div className="py-48 text-center border border-dashed border-white/5 rounded-[4rem] animate-fadeIn">
            <Search className="w-12 h-12 text-neutral-900 mx-auto mb-6" />
            <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-[10px]">No intelligence assets in this domain</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group relative aspect-[4/5] overflow-hidden bg-neutral-900 border border-white/5 rounded-[3rem] cursor-pointer animate-slideUp"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110 opacity-60 group-hover:opacity-100"
                />
                
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent transition-opacity duration-1000 ${hoveredId === project.id ? 'opacity-100' : 'opacity-0'}`}></div>
                
                <div className={`absolute inset-0 flex flex-col justify-end p-12 transition-all duration-700 ${hoveredId === project.id ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-[1px] w-8 bg-[#d4af37]"></div>
                    <span className="text-[#d4af37] text-[9px] font-black uppercase tracking-[0.4em]">{project.subCategory || project.category}</span>
                  </div>
                  <h4 className="text-3xl font-serif italic mb-8 leading-tight">{project.title}</h4>
                  
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center group-hover:rotate-[360deg] transition-all duration-1000">
                      <Plus className="w-7 h-7" />
                    </div>
                    <div className="flex-1 h-14 border border-white/10 rounded-full flex items-center px-8 text-[9px] uppercase font-black tracking-widest group-hover:bg-white group-hover:text-black transition-all">
                       Examine Case Study <ChevronRight className="ml-auto w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
