import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Camera, Wifi, Laptop, FileText, Briefcase, Code2, X, Plus, ArrowRight } from 'lucide-react';
import { SERVICES_DATA, WEB_DEV_TIERS } from '../../data/servicesData';
import type { ServiceCategory } from '../../data/servicesData';
import { useCartStore } from '../../store/cartStore';

const iconMap = { Tv, Camera, Wifi, Laptop, FileText, Briefcase, Code2 };

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (service: any, categoryName: string) => {
    addItem({
      id: service.id,
      slug: service.id,
      name: service.name,
      price: service.price,
      currency: 'KES',
      category: categoryName,
      estimateType: service.estimateType
    });
    openCart();
  };

  return (
    <div className="space-y-16 pb-20 pt-6 max-w-7xl mx-auto px-6">
      
      {/* Header Section */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-[#D96B43]">
          <Code2 className="w-3.5 h-3.5 text-[#D96B43]"/>
          <span>PROFESSIONAL // IT & ENGINEERING SERVICES</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-zinc-100">
          IT Services & Solutions
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
          Comprehensive technical support, system design, and digital services tailored for Nairobi and beyond. Transparent pricing, expert execution.
        </p>
      </div>

      {/* General Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES_DATA.map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap];
          return (
            <div 
              key={category.id} 
              onClick={() => setSelectedCategory(category)}
              className="group p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-[#D96B43]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] shadow-lg hover:shadow-[#D96B43]/5"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-zinc-800/50 w-fit group-hover:bg-[#D96B43]/10 transition-colors">
                  <Icon className="w-6 h-6 text-[#D96B43]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-zinc-100">{category.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{category.overview}</p>
              </div>
              <div className="pt-4 mt-4 flex items-center gap-1 text-xs font-mono text-[#D96B43] group-hover:translate-x-1 transition-transform">
                <span>View Sub-Services & Pricing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Web Development Matrix Section */}
      <div className="pt-12 border-t border-zinc-800">
        <div className="space-y-4 max-w-3xl mb-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-100">
            Full-Stack Web Development & Engineering
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            Custom web applications, enterprise platforms, and e-commerce systems built with React, FastAPI, and PostgreSQL.
          </p>
        </div>

        {/* Responsive Card Stack for Web Dev Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WEB_DEV_TIERS.map((tier) => (
            <div key={tier.id} className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border border-zinc-800 hover:border-[#D96B43]/40 transition-all duration-300 flex flex-col justify-between min-h-[200px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-serif font-bold text-zinc-100">{tier.type}</h3>
                  <span className="px-2.5 py-1 rounded-full bg-[#D96B43]/10 text-[10px] font-mono tracking-widest text-[#D96B43] uppercase border border-[#D96B43]/30">
                    {tier.timeframe}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{tier.deliverables}</p>
              </div>
              <div className="pt-4 mt-4 flex items-center justify-between border-t border-zinc-800/60">
                <span className="text-lg font-mono font-bold text-[#D96B43]">{tier.priceRange}</span>
                <button 
                  onClick={() => handleAddToCart({ id: tier.id, name: tier.type, price: parseInt(tier.priceRange.replace(/\D/g, '').slice(0, 5)), estimateType: 'Project Quote' }, 'Web Development')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-[#C25932] text-zinc-200 hover:text-white font-mono text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5"/> Request Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Service Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900/95 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-zinc-100">{selectedCategory.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{selectedCategory.overview}</p>
                </div>
                <button onClick={() => setSelectedCategory(null)} className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedCategory.subServices.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-medium text-zinc-100 text-sm">{sub.name}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{sub.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-sm font-mono font-bold text-[#D96B43]">KSh {sub.price.toLocaleString()}</span>
                        <span className="text-xs text-zinc-600">({sub.estimateType})</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(sub, selectedCategory.title)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-mono text-xs transition-colors shadow-sm flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
