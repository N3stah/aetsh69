import { useState } from 'react';
import { Search, ShoppingCart, Plus, Terminal } from 'lucide-react';
import { PRODUCTS_DATA } from '../../data/shopData';
import { useCartStore } from '../../store/cartStore';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const categories = ['All Items', 'Networking & Starlink', 'CCTV & Security', 'Streaming & Media', 'PC Upgrades', 'Tools & Accessories'];

  const filteredProducts = PRODUCTS_DATA.filter(product => {
    const matchesCategory = activeCategory === 'All Items' || product.category === activeCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: 'KES',
      image_url: product.image,
      category: product.category
    });
    openCart();
  };

  return (
    <div className="space-y-10 pb-20 pt-6 max-w-7xl mx-auto px-6">
      
      {/* Header Section */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-[#D96B43]">
          <Terminal className="w-3.5 h-3.5 text-[#D96B43]"/>
          <span>HARDWARE // NAIROBI TECH INVENTORY</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-zinc-100">
          The AETSH-69 Shop
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
          Premium networking gear, streaming hardware, PC upgrades, and precision tools — sourced and shipped from Nairobi.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-[#C25932] text-white font-semibold'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 focus:border-[#D96B43]/50 focus:outline-none text-sm text-zinc-200 placeholder:text-zinc-500 transition-colors"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden hover:border-[#D96B43]/50 transition-all duration-300 flex flex-col shadow-lg">
            
            {/* Product Image Frame */}
            <div className="relative aspect-square bg-zinc-950 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono tracking-widest text-[#D96B43] uppercase border border-white/10">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-sm font-medium text-zinc-100 mb-1">{product.name}</h3>
              <p className="text-xs text-zinc-500 mb-3 flex-1">{product.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-base font-mono font-bold text-[#D96B43]">
                  KSh {product.price.toLocaleString()}
                </span>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-mono text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-mono">No products found matching your search.</p>
        </div>
      )}

    </div>
  );
}
