import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Code2, Briefcase, MessageCircle , Download } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          
          {/* Brand & Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-zinc-100">AETSH-69</h3>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              Personal tech ecosystem of Mark Manoti Ndege. Built with React, FastAPI, and Docker.
            </p>
            <div className="space-y-3 pt-2">
              <a href="tel:+254722138632" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-[#D96B43] transition-colors group">
                <span className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-[#D96B43]/50 transition-colors">
                  <Phone size={14} className="text-[#D96B43]" />
                </span>
                +254 722 138632
              </a>
              <a href="mailto:aetsh69.com@gmail.com" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-[#D96B43] transition-colors group">
                <span className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-[#D96B43]/50 transition-colors">
                  <Mail size={14} className="text-[#D96B43]" />
                </span>
                aetsh69.com@gmail.com
              </a>
              <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                <span className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800">
                  <MapPin size={14} className="text-[#D96B43]" />
                </span>
                Nairobi, Kenya
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-500 mb-4">Explore</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm text-zinc-400 hover:text-[#D96B43] transition-colors">Home</Link></li>
                <li><Link to="/portfolio" className="text-sm text-zinc-400 hover:text-[#D96B43] transition-colors">Portfolio</Link></li>
                <li><Link to="/blog" className="text-sm text-zinc-400 hover:text-[#D96B43] transition-colors">Blog</Link></li>
                <li><Link to="/shop" className="text-sm text-zinc-400 hover:text-[#D96B43] transition-colors">Shop</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-500 mb-4">Connect</h4>
              <ul className="space-y-3">
                <li><Link to="/services" className="text-sm text-zinc-400 hover:text-[#D96B43] transition-colors">Services</Link></li>
                <li><Link to="/hobbies" className="text-sm text-zinc-400 hover:text-[#D96B43] transition-colors">Hobbies</Link></li>
                <li><Link to="/contact" className="text-sm text-zinc-400 hover:text-[#D96B43] transition-colors">Contact</Link></li>
                <li><Link to="/membership" className="text-sm text-zinc-400 hover:text-[#D96B43] transition-colors">Membership</Link></li>
              </ul>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-500 mb-4">Follow</h4>
            <div className="flex gap-3">
              <a href="https://github.com/N3stah" target="_blank" rel="noreferrer" className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#D96B43]/50 transition-colors">
                <Code2 size={18} />
              </a>
              <a href="https://www.linkedin.com/in/mark-manoti-ndege" target="_blank" rel="noreferrer" className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#D96B43]/50 transition-colors">
                <Briefcase size={18} />
              </a>
              <a href="https://x.com/Dark_ice69" target="_blank" rel="noreferrer" className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#D96B43]/50 transition-colors">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-zinc-800/60 text-center">
          <p className="text-xs font-mono text-zinc-600">
            © {new Date().getFullYear()} Mark Manoti Ndege. All rights reserved. Powered by AETSH-69.
          </p>
        </div>
      </div>
    
        
        <div className="max-w-2xl mx-auto mb-12 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center">
          <h3 className="font-serif text-xl text-zinc-100 mb-2">Looking for my full Resume?</h3>
          <p className="text-sm text-zinc-400 mb-5">View my complete CV in your browser or download it directly.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/assets_achieved/CV/Mark_Ndege_CV.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-600 transition-colors text-sm font-medium">
              <Eye size={16} /> View CV
            </a>
            <a href="/assets_achieved/CV/Mark_Ndege_CV.pdf" download className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white transition-colors text-sm font-medium shadow-md shadow-[#C25932]/20">
              <Download size={16} /> Download CV
            </a>
          </div>
        </div>

    </footer>
  );
}
