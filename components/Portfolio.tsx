
import React, { useState, useEffect } from 'react';
import { Category, Project } from '../types';
import { portfolioService } from '../services/portfolioService';
import { ExternalLink, Plus, Search } from 'lucide-react';

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const refreshPortfolio = () => {
    setProjects(portfolioService.getProjects());
  };

  useEffect(() => {
    refreshPortfolio();
    
    window.addEventListener('storage', refreshPortfolio);
    window.addEventListener('portfolioUpdated', refreshPortfolio);
    
    return () => {
      window.removeEventListener('storage', refreshPortfolio);
      window.removeEventListener('portfolioUpdated', refreshPortfolio);
    };
  }, []);

  const categories = ['All', ...Object.values(Category)];

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="portfolio" className="py-32 bg-[#050505]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="animate-fadeIn">
            <h2 className="text-[#d4af37] uppercase tracking-[0.4em] text-[10px] font-black mb-4">Master Gallery</h2>
            <h3 className="text-5xl md:text-7xl font-serif italic tracking-tighter">Strategic <br/><span className="gold-text not-italic font-sans font-black">Design Assets</span></h3>
          </div>
          
          <div className="flex flex-wrap gap-2 animate-slideUp">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`px-6 py-2.5 text-[10px] uppercase tracking-widest font-black transition-all rounded-full border ${
                  activeCategory === cat 
                    ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-[0_10px_20px_rgba(212,175,55,0.2)]' 
                    : 'border-white/5 text-gray-600 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem] animate-fadeIn">
            <Search className="w-12 h-12 text-neutral-900 mx-auto mb-6" />
            <p className="text-gray-600 font-black uppercase tracking-widest text-[10px]">No brand assets published in this domain</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group relative aspect-[4/5] overflow-hidden bg-neutral-900 border border-white/5 rounded-[2.5rem] cursor-pointer animate-slideUp"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                
                {/* Visual Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500 ${hoveredId === project.id ? 'opacity-100' : 'opacity-0'}`}></div>
                
                <div className={`absolute inset-0 flex flex-col justify-end p-12 transition-all duration-700 ${hoveredId === project.id ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.4em] mb-4">{project.subCategory || project.category}</span>
                  <h4 className="text-3xl font-serif italic mb-6 leading-tight">{project.title}</h4>
                  
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-700">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="flex-1 border border-white/20 rounded-full flex items-center justify-center text-[10px] uppercase font-black tracking-widest hover:bg-white hover:text-black transition-all">
                      View Diagnostics
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
