import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Code2, 
  Brain, 
  Wifi,
  Camera, 
  ShoppingBag, 
  Users, 
  Heart,
  MapPin,
  Terminal
} from 'lucide-react';

const sections = [
  { 
    icon: Code2, 
    title: 'Portfolio', 
    desc: 'Engineering projects and case studies', 
    path: '/portfolio', 
    color: 'text-rust' 
  },
  { 
    icon: Brain, 
    title: 'AETSH-69 AI', 
    desc: 'My AI concierge — ask me anything', 
    path: null, 
    color: 'text-rust' 
  },
  { 
    icon: ShoppingBag, 
    title: 'Shop', 
    desc: 'Tools, kits and service packages', 
    path: '/shop', 
    color: 'text-rust' 
  },
  { 
    icon: Wifi, 
    title: 'Services', 
    desc: 'Engineering and IT consultancy', 
    path: '/services', 
    color: 'text-rust' 
  },
  { 
    icon: Camera, 
    title: 'Hobbies', 
    desc: 'Photography, cooking, arcade games', 
    path: '/hobbies', 
    color: 'text-rust' 
  },
  { 
    icon: Users, 
    title: 'Membership', 
    desc: 'Join the ecosystem — Builder tier', 
    path: '/membership', 
    color: 'text-rust' 
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-16 max-w-7xl mx-auto px-6">
      
      {/* HERO SECTION: 2-COLUMN GRID */}
      <section className="relative pt-6 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Bio & Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Location Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-[#D96B43]">
              <MapPin className="w-3.5 h-3.5 text-[#D96B43]"/>
              <span>Nairobi, Kenya</span>
            </div>

            {/* Name Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-zinc-100 leading-none">
              Mark Manoti <br />
              <span className="text-zinc-200">Ndege</span>
            </h1>

            {/* Subtitle / Pitch */}
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
              Software engineer, AI builder, and technologist. I design and ship full-stack systems, AI-powered products, and IT services — from Nairobi to the world.
            </p>

            {/* CTA Buttons & Support Badge */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-medium shadow-lg shadow-[#C25932]/20 transition-all duration-200" to="/portfolio">
                View Portfolio
                <ArrowRight className="w-4 h-4"/>
              </Link>

              <Link className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium transition-all duration-200" to="/services">
                My Services
              </Link>

              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs font-mono text-zinc-400">
                <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/20"/>
                <span>Support my work</span>
              </div>
            </div>

          </div>

          {/* Right Column: Glass-Neumorphic Portrait Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group w-full max-w-md">
              
              {/* Soft Ambient Background Glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#D96B43]/30 to-amber-600/20 blur-2xl opacity-70 group-hover:opacity-100 transition duration-500" />

              {/* Neumorphic Extrusive Glass Shell */}
              <div className="relative p-3 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-[16px_16px_36px_rgba(0,0,0,0.85),-8px_-8px_24px_rgba(255,255,255,0.03)] transition-all duration-300 group-hover:border-[#D96B43]/40">
                
                {/* CAD Corner Ticks */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D96B43]/60" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D96B43]/60" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D96B43]/60" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D96B43]/60" />

                {/* Inner Image Container */}
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-zinc-950">
                  <img
                    src="/mark-homepage-image1.jpeg"
                    alt="Mark Manoti Ndege"
                    className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  
                  {/* Subtle Gradient Vignette Over Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Simplified Floating Architectural Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-2.5 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center gap-2">
                  <Terminal className="w-4 h-4 text-[#D96B43]"/>
                  <span className="font-mono text-xs font-medium text-zinc-200 tracking-wider">MARK MANOTI</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6-SECTION NAVIGATION GRID (UNCHANGED) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const CardContent = (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-[#D96B43]/50 backdrop-blur-sm transition-all duration-200 group h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-800/50 w-fit group-hover:bg-[#D96B43]/10 transition-colors">
                  <Icon className="w-6 h-6 text-[#D96B43]"/>
                </div>
                <h3 className="text-xl font-serif font-semibold text-zinc-100">{section.title}</h3>
                <p className="text-sm text-zinc-400">{section.desc}</p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-mono text-[#D96B43] group-hover:translate-x-1 transition-transform">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </div>
            </div>
          );

          return section.path ? (
            <Link key={idx} to={section.path}>
              {CardContent}
            </Link>
          ) : (
            <div key={idx} className="cursor-pointer">
              {CardContent}
            </div>
          );
        })}
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-[#C25932]/20 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-serif font-bold text-zinc-100">Join the ecosystem</h2>
          <p className="text-sm text-zinc-400">Get exclusive tutorials, priority AI access, and direct collaboration.</p>
        </div>
        <Link className="px-6 py-3 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-medium text-sm whitespace-nowrap transition-colors" to="/membership">
          View membership plans &rarr;
        </Link>
      </section>

    </div>
  );
}
