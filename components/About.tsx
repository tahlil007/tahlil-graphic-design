
import React from 'react';
import { Award, Layers, Zap, Heart } from 'lucide-react';

const About: React.FC = () => {
  const skills = ['Photoshop', 'Illustrator', 'Branding', 'Social Media Design', 'Print Media', 'Typography'];
  
  const stats = [
    { label: 'Experience', value: '5+ Years', icon: Award },
    { label: 'Projects', value: '450+', icon: Layers },
    { label: 'Satisfaction', value: '100%', icon: Heart },
    { label: 'Avg Speed', value: '2 Days', icon: Zap },
  ];

  return (
    <section id="about" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="relative group">
            <div className="absolute inset-0 border-2 border-[#d4af37] translate-x-4 translate-y-4 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-all"></div>
            <div className="aspect-[4/5] overflow-hidden bg-neutral-900 border border-white/10">
              <img 
                src="https://picsum.photos/seed/designer/800/1000" 
                alt="Graphic Designer" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-[#d4af37] p-8 hidden md:block">
              <h4 className="text-black font-black text-2xl leading-none">TAHLIL<br/>DESIGN GOLD</h4>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <h2 className="text-[#d4af37] uppercase tracking-widest text-sm mb-2">The Designer</h2>
              <h3 className="text-4xl md:text-5xl font-serif italic mb-6 leading-tight">Crafting Visual Legacies Since 2018</h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                I am a passionate freelance graphic designer dedicated to helping brands find their unique voice. My approach blends artistic flair with strategic thinking to ensure every design doesn't just look good, but delivers results.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Whether you're a startup looking for its first logo or an established business needing a brand refresh, I provide premium, custom solutions that stand out in a crowded marketplace.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center space-x-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <stat.icon className="w-6 h-6 text-[#d4af37]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Core Expertise</h4>
              <div className="flex flex-wrap gap-3">
                {skills.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-neutral-900 border border-white/5 rounded-full text-xs font-medium text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;