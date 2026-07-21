import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCartStore();
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-canvas-raised border-l border-line z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-rust" />
            <span className="font-semibold text-ink">Cart ({itemCount()})</span>
          </div>
          <button onClick={closeCart}><X size={20} className="text-ink-faint" /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <ShoppingBag size={40} className="text-ink-faint" />
            <p className="text-ink-muted">Your cart is empty</p>
            <button onClick={closeCart} className="btn-secondary text-sm">Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-canvas-overlay rounded-md border border-line flex items-center justify-center flex-shrink-0">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-md" />
                      : <ShoppingBag size={20} className="text-ink-faint" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-sm font-medium truncate">{item.name}</p>
                    <p className="text-rust text-sm font-mono">{item.currency} {(item.price * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-line flex items-center justify-center text-ink-muted hover:border-rust/40">
                        <Minus size={12} />
                      </button>
                      <span className="text-ink text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-line flex items-center justify-center text-ink-muted hover:border-rust/40">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-ink-faint hover:text-rust">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-5 py-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-ink-muted text-sm">Total</span>
                <span className="text-ink font-mono font-semibold text-lg">KES {total().toLocaleString()}</span>
              </div>
              <Link to="/checkout" onClick={closeCart} className="btn-primary w-full text-center block text-sm mb-2">
                Proceed to Checkout
              </Link>
              <button onClick={closeCart} className="btn-ghost w-full text-sm">Continue Shopping</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
