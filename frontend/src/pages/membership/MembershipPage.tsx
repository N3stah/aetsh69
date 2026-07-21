import { Star, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const tiers = [
  { name: 'Explorer', price: 'Free', description: 'Browse the ecosystem, read public posts, and chat with AETSH-69.', features: ['Public blog access','AETSH-69 chat (general)','Portfolio browsing','Shop access'], cta: 'Get Started', highlighted: false, action: 'register' },
  { name: 'Builder', price: 'KES 1,500/mo', description: 'Priority support, exclusive content, and early access to new tools.', features: ['Everything in Explorer','Priority AETSH-69 responses','Exclusive tutorials','Early product access','Monthly Q&A calls'], cta: 'Join Builder', highlighted: true, action: 'register' },
  { name: 'Enterprise', price: 'Custom', description: 'Dedicated consulting, custom builds, and direct engineering support.', features: ['Everything in Builder','Dedicated Slack channel','Custom development','On-site support (Nairobi)','SLA guarantee'], cta: 'Contact Us', highlighted: false, action: 'contact' },
];

export default function MembershipPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleCta = (action: string) => {
    if (action === 'contact') {
      window.location.href = 'mailto:aetsh69.com@gmail.com?subject=Enterprise%20Membership%20Enquiry&body=Hi%20Mark%2C%0A%0AI%27m%20interested%20in%20the%20Enterprise%20tier.%20Here%27s%20what%20I%27m%20looking%20for%3A%0A%0A';
      return;
    }
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/upgrade');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <p className="text-rust font-mono text-sm mb-2">Membership</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink">Choose Your Level</h1>
        <p className="text-ink-muted text-lg mt-4 leading-relaxed">Support the ecosystem and unlock deeper access to tools, knowledge, and direct collaboration.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tiers.map(t => (
          <div key={t.name} className={`card flex flex-col ${t.highlighted ? 'border-rust/40 shadow-[0_4px_16px_rgba(0,0,0,0.5)]' : 'card-hover'}`}>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-display text-xl font-semibold text-ink">{t.name}</h2>
              {t.highlighted && <Star size={16} className="text-rust" />}
            </div>
            <p className="font-mono text-2xl text-ink mb-2">{t.price}</p>
            <p className="text-ink-muted text-sm leading-relaxed mb-6">{t.description}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {t.features.map(f => (
                <li key={f} className="text-ink-muted text-sm flex items-start gap-2.5">
                  <Check size={16} className="text-rust shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCta(t.action)}
              className={`w-full text-sm ${t.highlighted ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t.action === 'register' && isAuthenticated ? 'Go to Dashboard' : t.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
