import { useEffect, useState } from 'react';
import { ShoppingCart, ShoppingBag, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { AddItemModal } from '../../components/admin/AddItemModal';
import { useCartStore } from '../../store/cartStore';

interface Product {
  id: string; slug: string; name: string; short_description?: string; description?: string;
  price_kes: number; price_usd?: number; stock_quantity: number; category_name?: string;
  tags?: string[]; images?: string[];
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/shop/products');
        if (mounted) setProducts(Array.isArray(res.data) ? res.data : (res.data?.products || []));
      } catch {
        if (mounted) setError('Could not load products.');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleAddProduct = async (data: Record<string, string | number | string[]>) => {
    await api.post('/shop/products', {
      name: data.name,
      description: data.description,
      price_kes: data.price_kes,
      stock_quantity: data.stock_quantity,
      category: data.category || 'general',
      image_url: data.image_url
    });
    const res = await api.get('/shop/products');
    setProducts(Array.isArray(res.data) ? res.data : (res.data?.products || []));
  };

  const modalFields = [
    { name: 'name', label: 'Product Name', type: 'text' as const, placeholder: 'Arduino Uno Kit' },
    { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'What is in the box?' },
    { name: 'price_kes', label: 'Price (KES)', type: 'number' as const, placeholder: '5000' },
    { name: 'stock_quantity', label: 'Stock Quantity', type: 'number' as const, placeholder: '10' },
    { name: 'category', label: 'Category', type: 'text' as const, placeholder: 'Electronics' },
    { name: 'image_url', label: 'Product Image', type: 'file' as const }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-2xl mb-12 flex justify-between items-start">
        <div>
          <p className="text-rust font-mono text-sm mb-2">Shop</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink">Tools & Kits</h1>
          <p className="text-ink-muted text-lg mt-4 leading-relaxed">Physical products, digital tools, and service packages — shipped from Nairobi.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded text-sm mt-2">
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {error && <div className="card border-rust/30 mb-8"><p className="text-rust text-sm">{error}</p></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => {
          const inStock = p.stock_quantity > 0;
          const image = p.images?.[0] || null;
          return (
            <div key={p.id} className="card card-hover flex flex-col">
              {image ? (
                <img src={image} alt={p.name} className="w-full h-48 object-cover rounded-md mb-4 border border-line" />
              ) : (
                <div className="w-full h-48 bg-canvas-overlay rounded-md mb-4 border border-line flex items-center justify-center">
                  <ShoppingBag size={32} className="text-ink-faint" />
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-display text-lg font-semibold text-ink">{p.name}</h2>
                {p.category_name && <span className="badge text-[10px]">{p.category_name}</span>}
              </div>
              <p className="text-ink-muted text-sm leading-relaxed flex-1">{p.short_description || p.description}</p>
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-line text-ink-faint">{tag}</span>)}
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                <div>
                  <span className="font-mono text-lg text-ink">KES {p.price_kes.toLocaleString()}</span>
                  {p.price_usd && <span className="text-ink-faint text-xs ml-2">(~${p.price_usd})</span>}
                </div>
                <button
                  disabled={!inStock}
                  onClick={() => addItem({
                    id: p.id, slug: p.slug, name: p.name,
                    price: p.price_kes, currency: 'KES',
                    image_url: image || undefined,
                    category: p.category_name,
                  })}
                  className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ShoppingCart size={14} />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddProduct} title="Add New Product" fields={modalFields} />
    </div>
  );
}
