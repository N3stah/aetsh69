import { useEffect, useState } from 'react';
import { Clock, ChefHat, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { AddItemModal } from '../../components/admin/AddItemModal';

interface Recipe { id: string; title: string; description?: string; prep_time_minutes?: number; cook_time_minutes?: number; servings?: number; image_url?: string; tags?: string[]; difficulty?: string; }

const fallback: Recipe[] = [
  { id: '1', title: 'Nyama Choma Rub', description: 'A dry rub blend for goat or beef, slow-grilled over charcoal.', prep_time_minutes: 15, cook_time_minutes: 240, servings: 6, tags: ['Grill', 'Kenyan'], difficulty: 'Medium' },
  { id: '2', title: 'Pilau Masala', description: 'Fragrant rice with whole spices, cumin, and caramelized onions.', prep_time_minutes: 20, cook_time_minutes: 45, servings: 4, tags: ['Rice', 'Swahili'], difficulty: 'Easy' },
  { id: '3', title: 'Ugali & Sukuma Wiki', description: 'Classic Kenyan staple — white corn meal with braised collard greens.', prep_time_minutes: 10, cook_time_minutes: 20, servings: 4, tags: ['Kenyan', 'Vegetarian'], difficulty: 'Easy' },
  { id: '4', title: 'Mandazi', description: 'East African doughnuts spiced with cardamom and coconut milk.', prep_time_minutes: 30, cook_time_minutes: 20, servings: 12, tags: ['Snack', 'Swahili'], difficulty: 'Easy' },
  { id: '5', title: 'Githeri', description: 'Slow-cooked maize and beans with tomato, onion and spices.', prep_time_minutes: 15, cook_time_minutes: 90, servings: 6, tags: ['Kenyan', 'Vegetarian'], difficulty: 'Easy' },
  { id: '6', title: 'Samaki wa Kupaka', description: 'Coastal spiced fish in coconut milk — a Swahili classic.', prep_time_minutes: 20, cook_time_minutes: 30, servings: 4, tags: ['Seafood', 'Coastal'], difficulty: 'Medium' },
];

export default function CookingPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let mounted = true;
    const fetchRecipes = async () => {
      try {
        const r = await api.get('/cooking/');
        if (mounted) setRecipes(r.data && r.data.length > 0 ? r.data : fallback);
      } catch {
        if (mounted) setRecipes(fallback);
      }
    };
    fetchRecipes();
    return () => { mounted = false; };
  }, []);

  const handleAddRecipe = async (data: Record<string, string | number | string[]>) => {
    await api.post('/cooking/', {
      title: data.title,
      description: data.description,
      prep_time_minutes: data.prep_time_minutes,
      cook_time_minutes: data.cook_time_minutes,
      tags: data.tags,
      image_url: data.image_url
    });
    const r = await api.get('/cooking/');
    setRecipes(r.data && r.data.length > 0 ? r.data : fallback);
  };

  const modalFields = [
    { name: 'title', label: 'Title', type: 'text' as const, placeholder: 'Nyama Choma' },
    { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'A delicious meal...' },
    { name: 'prep_time_minutes', label: 'Prep Time (mins)', type: 'number' as const, placeholder: '15' },
    { name: 'cook_time_minutes', label: 'Cook Time (mins)', type: 'number' as const, placeholder: '60' },
    { name: 'tags', label: 'Tags', type: 'list' as const, placeholder: 'Kenyan, Dinner' },
    { name: 'image_url', label: 'Recipe Photo', type: 'file' as const }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10 flex justify-between items-start">
        <div>
          <p className="text-rust font-mono text-sm mb-2">Hobbies</p>
          <h1 className="font-display text-4xl font-semibold text-ink mb-2 flex items-center gap-3">
            <ChefHat size={32} className="text-rust" /> Cooking
          </h1>
          <p className="text-ink-muted">Kenyan and East African recipes — from Nairobi's kitchen.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded text-sm"
          >
            <Plus size={16} /> Add Recipe
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(r => (
          <div key={r.id} className="card card-hover flex flex-col">
            {r.image_url ? (
              <img src={r.image_url} alt={r.title} className="w-full h-48 object-cover rounded-md mb-4 border border-line" />
            ) : (
              <div className="w-full h-48 bg-canvas-overlay rounded-md mb-4 border border-line flex items-center justify-center">
                <ChefHat size={32} className="text-ink-faint" />
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-semibold text-ink">{r.title}</h2>
              {r.difficulty && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${r.difficulty === 'Easy' ? 'border-green-800 text-green-500' : 'border-rust/40 text-rust'}`}>
                  {r.difficulty}
                </span>
              )}
            </div>
            {r.description && <p className="text-ink-muted text-sm leading-relaxed flex-1 mb-4">{r.description}</p>}
            <div className="flex items-center gap-4 text-ink-faint text-xs pt-3 border-t border-line">
              {(r.prep_time_minutes || r.cook_time_minutes) && (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {(r.prep_time_minutes || 0) + (r.cook_time_minutes || 0)} min
                </span>
              )}
              {r.servings && <span>Serves {r.servings}</span>}
              {r.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded border border-line">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddRecipe} 
        title="Add New Recipe" 
        fields={modalFields} 
      />
    </div>
  );
}
