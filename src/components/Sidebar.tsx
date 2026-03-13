import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategoryId, onSelectCategory, isOpen, onClose }) => {
  const mainCats = categories.filter(c => !c.parent_id);

  const IconComponent = ({ name, color, active }: { name: string; color: string; active: boolean }) => {
    const Icon = (LucideIcons as any)[name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || LucideIcons.MapPin;
    return <Icon className="w-3.5 h-3.5" />;
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      <aside className={`fixed md:relative top-0 left-0 h-full w-80 bg-bg border-r border-border overflow-y-auto flex flex-col z-[70] transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="md:hidden absolute top-6 right-6">
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">
            <LucideIcons.X className="w-5 h-5 text-accent" />
          </button>
        </div>
        
        <div className="px-10 py-12">
        <h3 className="text-micro text-accent mb-10 opacity-60">
          Collections
        </h3>
        
        <nav className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`group w-full flex items-center gap-6 transition-all py-1.5 border-b border-border/10 ${
              selectedCategoryId === null 
                ? 'text-ink' 
                : 'text-accent hover:text-ink'
            }`}
          >
            <div className={`w-8 h-8 flex items-center justify-center transition-all rounded-full ${
              selectedCategoryId === null ? 'bg-premium text-white shadow-lg' : 'bg-transparent'
            }`}>
              <LucideIcons.Map className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs tracking-tight transition-all font-bold ${selectedCategoryId === null ? 'opacity-100' : 'opacity-60'}`}>
              Tout voir
            </span>
          </button>

          {mainCats.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group w-full flex items-center gap-6 transition-all py-1.5 border-b border-border/10 ${
                selectedCategoryId === cat.id 
                  ? 'text-ink' 
                  : 'text-accent hover:text-ink'
              }`}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center transition-all duration-500 rounded-full ${
                  selectedCategoryId === cat.id ? 'bg-premium text-white shadow-lg' : 'bg-transparent text-accent group-hover:text-ink'
                }`}
              >
                <IconComponent 
                  name={cat.icon || 'map-pin'} 
                  color={cat.color || '#5A5A5A'} 
                  active={selectedCategoryId === cat.id} 
                />
              </div>
              <span className={`text-xs tracking-tight transition-all font-bold ${selectedCategoryId === cat.id ? 'opacity-100' : 'opacity-60'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-10 flex flex-col gap-4">
        <button 
          onClick={() => window.location.hash = '#about'}
          className="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-ink transition-colors text-left"
        >
          À propos
        </button>
        <a 
          href="mailto:contact@gentlemap.com"
          className="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-ink transition-colors text-left"
        >
          Contact
        </a>
        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div className="flex gap-4">
            <a href="mailto:contact@gentlemap.com">
              <LucideIcons.Mail className="w-3.5 h-3.5 text-accent/40 hover:text-ink cursor-pointer transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
