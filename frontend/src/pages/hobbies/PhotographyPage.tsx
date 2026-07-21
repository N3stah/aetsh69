import { useEffect, useState } from 'react';
import { X, Camera, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { AddItemModal } from '../../components/admin/AddItemModal';

interface Photo { id: string; image_url: string; title?: string; location?: string; description?: string; }

const fallback: Photo[] = [
  { id: '1', image_url: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800', title: 'Nairobi Skyline', location: 'Nairobi, Kenya' },
  { id: '2', image_url: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800', title: 'Savanna Sunset', location: 'Maasai Mara' },
  { id: '3', image_url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800', title: 'Wildlife', location: 'Amboseli' },
  { id: '4', image_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', title: 'Mount Kenya', location: 'Central Kenya' },
  { id: '5', image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', title: 'Coast Sunset', location: 'Mombasa' },
  { id: '6', image_url: 'https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=800', title: 'Street Life', location:'Nairobi CBD' },
];

export default function PhotographyPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let mounted = true;
    const fetchPhotos = async () => {
      try {
        const r = await api.get('/photography/');
        if (mounted) setPhotos(r.data && r.data.length > 0 ? r.data : fallback);
      } catch {
        if (mounted) setPhotos(fallback);
      }
    };
    fetchPhotos();
    return () => { mounted = false; };
  }, []);

  const handleAddPhoto = async (data: Record<string, string | number | string[]>) => {
    await api.post('/photography/', data);
    const r = await api.get('/photography/');
    setPhotos(r.data && r.data.length > 0 ? r.data : fallback);
  };

  const modalFields = [
    { name: 'title', label: 'Title', type: 'text' as const, placeholder: 'Nairobi Skyline' },
    { name: 'image_url', label: 'Photo', type: 'file' as const },
    { name: 'location', label: 'Location', type: 'text' as const, placeholder: 'Nairobi, Kenya' },
    { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'A beautiful sunset over the city...' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10 flex justify-between items-start">
        <div>
          <p className="text-rust font-mono text-sm mb-2">Hobbies</p>
          <h1 className="font-display text-4xl font-semibold text-ink mb-2 flex items-center gap-3">
            <Camera size={32} className="text-rust" /> Photography
          </h1>
          <p className="text-ink-muted">Moments captured across Kenya and beyond.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded text-sm"
          >
            <Plus size={16} /> Add Photo
          </button>
        )}
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {photos.map(photo => (
          <div key={photo.id} onClick={() => setLightbox(photo)}
            className="break-inside-avoid cursor-pointer group overflow-hidden rounded-lg border border-line hover:border-rust/40 transition-all">
            <div className="relative overflow-hidden">
              <img src={photo.image_url} alt={photo.title || 'Photo'}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end p-3 opacity-0 group-hover:opacity-100">
                {photo.location && <span className="text-white text-xs font-medium">{photo.location}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={28} /></button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full">
            <img src={lightbox.image_url} alt={lightbox.title} className="w-full max-h-[80vh] object-contain rounded-lg" />
            {(lightbox.title || lightbox.location) && (
              <div className="mt-3 text-center">
                {lightbox.title && <p className="text-white font-medium">{lightbox.title}</p>}
                {lightbox.location && <p className="text-white/60 text-sm">{lightbox.location}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddPhoto} 
        title="Add New Photo" 
        fields={modalFields} 
      />
    </div>
  );
}
