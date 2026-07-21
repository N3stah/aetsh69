import { useEffect, useState } from 'react';
import { Shield, Wifi, Laptop, Tv, FileText, Briefcase, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { AddItemModal } from '../../components/admin/AddItemModal';

interface Service {
  id: string; slug: string; name: string; title?: string; description?: string;
  icon?: string; features?: string[]; price_kes?: number; price?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield size={24} />, wifi: <Wifi size={24} />, laptop: <Laptop size={24} />,
  tv: <Tv size={24} />, filetext: <FileText size={24} />, briefcase: <Briefcase size={24} />,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const fallback: Service[] = [
    { id: '1', slug: 'cctv', name: 'CCTV Installation', description: 'Professional security camera setup for homes and businesses. HD, night vision, and remote monitoring.', icon: 'shield', features: ['HD cameras','Night vision','Remote access','Cloud storage'] },
    { id: '2', slug: 'networking', name: 'Networking', description: 'Structured cabling, Wi-Fi optimization, and network infrastructure for reliable connectivity.', icon: 'wifi', features: ['Structured cabling','Wi-Fi 6','VPN setup','Network security'] },
    { id: '3', slug: 'it-consultation', name: 'IT Consultation', description: 'Strategic technology advice for startups and SMEs. Architecture, stack selection, and scaling.', icon: 'briefcase', features: ['Tech strategy','Stack audits','Cloud migration','DevOps'] },
    { id: '4', slug: 'cyber', name: 'Cyber Services', description: 'Penetration testing, security audits, and compliance guidance for digital assets.', icon: 'laptop', features: ['Pen testing','Security audits','Compliance','Incident response'] },
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/services/');
        if (mounted) setServices(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (mounted) setError('Could not load services.');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const display = services.length > 0 ? services : fallback;

  const handleAddService = async (data: Record<string, string | number | string[]>) => {
    await api.post('/services/', {
      name: data.name,
      description: data.description,
      price_kes: data.price_kes,
      features: data.features,
      icon: data.icon || 'briefcase'
    });
    const res = await api.get('/services/');
    setServices(Array.isArray(res.data) ? res.data : []);
  };

  const modalFields = [
    { name: 'name', label: 'Service Name', type: 'text' as const, placeholder: 'CCTV Installation' },
    { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'What does this service include?' },
    { name: 'price_kes', label: 'Price (KES)', type: 'number' as const, placeholder: '15000' },
    { name: 'features', label: 'Features', type: 'list' as const, placeholder: 'HD cameras, Night vision' },
    { name: 'icon', label: 'Icon (shield, wifi, laptop, tv, filetext, briefcase)', type: 'text' as const, placeholder: 'briefcase' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-2xl mb-12 flex justify-between items-start">
        <div>
          <p className="text-rust font-mono text-sm mb-2">Services</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink">What I Build & Fix</h1>
          <p className="text-ink-muted text-lg mt-4 leading-relaxed">Technical services delivered with precision — from physical infrastructure to digital systems.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded text-sm mt-2">
            <Plus size={16} /> Add Service
          </button>
        )}
      </div>

      {error && <div className="card border-rust/30 mb-8"><p className="text-rust text-sm">{error}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {display.map(s => (
          <div key={s.id} className="card card-hover">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-rust-muted flex items-center justify-center text-ink shrink-0">
                {(s.icon && iconMap[s.icon.toLowerCase()]) || <Briefcase size={24} />}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-semibold text-ink">{s.title || s.name}</h2>
                <p className="text-ink-muted text-sm mt-2 leading-relaxed">{s.description}</p>
                {s.features && (
                  <ul className="mt-4 space-y-1.5">
                    {s.features.map(f => <li key={f} className="text-ink-faint text-sm flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-rust" />{f}</li>)}
                  </ul>
                )}
                {s.price_kes ? <p className="text-rust font-mono text-sm mt-4">KES {s.price_kes.toLocaleString()}</p> : s.price && <p className="text-rust font-mono text-sm mt-4">{s.price}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddService} title="Add New Service" fields={modalFields} />
    </div>
  );
}
