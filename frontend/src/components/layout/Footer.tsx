import { Link } from 'react-router-dom';

const explore = [
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Blog', path: '/blog' },
  { label: 'Services', path: '/services' },
  { label: 'Shop', path: '/shop' },
];

const hobbies = [
  { label: 'Photography', path: '/photography' },
  { label: 'Cooking', path: '/cooking' },
  { label: 'Arcade', path: '/arcade' },
  { label: 'Membership', path: '/membership' },
];

const social = [
  { label: 'GitHub', url: 'https://github.com/N3stah' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/mark-manoti-ndege' },
  { label: 'X / Twitter', url: 'https://x.com/Dark_ice69' },
  { label: 'Email', url: 'mailto:aetsh69.com@gmail.com' },
];

export default function Footer() {
  return (
    <footer className="border-t border-line mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display font-semibold text-lg text-ink mb-3 block">
              AETSH<span className="text-rust">-69</span>
            </Link>
            <p className="text-ink-muted text-sm leading-relaxed">
              Personal tech ecosystem of Mark Manoti Ndege — software engineer, builder, and technologist based in Nairobi, Kenya.
            </p>
          </div>
          <div>
            <p className="text-ink text-sm font-semibold mb-4">Explore</p>
            <ul className="space-y-2">
              {explore.map(item => (
                <li key={item.path}>
                  <Link to={item.path} className="text-ink-muted text-sm hover:text-ink transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-ink text-sm font-semibold mb-4">Hobbies</p>
            <ul className="space-y-2">
              {hobbies.map(item => (
                <li key={item.path}>
                  <Link to={item.path} className="text-ink-muted text-sm hover:text-ink transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-ink text-sm font-semibold mb-4">Connect</p>
            <ul className="space-y-2">
              {social.map(item => (
                <li key={item.label}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-ink-muted text-sm hover:text-ink transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-line pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-ink-faint text-xs">© {new Date().getFullYear()} Mark Manoti Ndege. All rights reserved.</p>
          <p className="text-ink-faint text-xs">Powered by <span className="text-rust">AETSH-69</span></p>
        </div>
      </div>
    </footer>
  );
}
