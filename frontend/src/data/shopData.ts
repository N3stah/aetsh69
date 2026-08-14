export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

export const shopProducts: Product[] = [
  // Networking & Starlink
  {
    id: 'starlink-mesh-router',
    name: 'SpaceX Starlink Mesh Wi-Fi Router (Standalone Replacement)',
    slug: 'starlink-mesh-router',
    price: 28000,
    category: 'Networking & Starlink',
    description: 'Official standalone SpaceX Starlink Mesh router for expanding Wi-Fi coverage or replacing mesh units.',
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tplink-ac1200-router',
    name: 'TP-Link / Mercusys AC1200 Dual-Band Router',
    slug: 'tplink-ac1200-router',
    price: 3800,
    category: 'Networking & Starlink',
    description: 'Dual-band high-gain antennas for home and office fiber optic extensions.',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4g-mifi-router',
    name: '4G LTE Portable Pocket MiFi Router (Unlocked)',
    slug: '4g-mifi-router',
    price: 3200,
    category: 'Networking & Starlink',
    description: 'Unlocked mobile Wi-Fi hotspot supporting Safaricom, Airtel, and Faiba 4G SIM cards.',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat6-lan-cable-meter',
    name: 'Cat6 Outdoor LAN Ethernet Cable (Per Meter)',
    slug: 'cat6-lan-cable-meter',
    price: 50,
    category: 'Networking & Starlink',
    description: 'Pure copper weather-resistant Cat6 network cable cut to custom length.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat6-patch-cord-10m',
    name: 'Pre-Crimped Cat6 Patch Cord (10 Meters)',
    slug: 'cat6-patch-cord-10m',
    price: 650,
    category: 'Networking & Starlink',
    description: 'Factory-molded RJ45 Ethernet patch cable for high-speed routers, PCs, and smart TVs.',
    image: 'https://images.unsplash.com/photo-1601524909162-ae8ed68b2014?auto=format&fit=crop&w=800&q=80'
  },

  // CCTV & Security
  {
    id: 'v380-smart-cctv',
    name: 'V380 Mini Wireless Smart CCTV Camera (Bulb Mount)',
    slug: 'v380-smart-cctv',
    price: 2500,
    category: 'CCTV & Security',
    description: 'HD night-vision Wi-Fi camera with 360° motion tracking and remote phone app monitoring.',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'
  },

  // Streaming & Media
  {
    id: 'firestick-4k-max',
    name: 'Amazon Fire TV Stick 4K Max',
    slug: 'firestick-4k-max',
    price: 7000,
    category: 'Streaming & Media',
    description: 'Ultra HD streaming media player pre-configured for IPTV, Stremio, Netflix, and YouTube.',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'blank-dvd-cd-pack',
    name: 'Blank DVD-R / CD-R Discs (Spindle 10-Pack)',
    slug: 'blank-dvd-cd-pack',
    price: 450,
    category: 'Streaming & Media',
    description: '4.7GB blank DVD-R discs for data archiving, media burning, and system backups.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  },

  // PC Upgrades
  {
    id: '8gb-ddr4-ram',
    name: 'Laptop & Desktop 8GB DDR4 RAM (3200MHz)',
    slug: '8gb-ddr4-ram',
    price: 3200,
    category: 'PC Upgrades',
    description: 'High-performance SODIMM / DIMM RAM module for speeding up multitasking.',
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '256gb-nvme-ssd',
    name: '256GB M.2 NVMe Solid State Drive',
    slug: '256gb-nvme-ssd',
    price: 3800,
    category: 'PC Upgrades',
    description: 'High-speed internal SSD with boot speeds up to 2100MB/s for laptops and PCs.',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
  },

  // Tools & Accessories
  {
    id: 'precision-screwdriver-kit',
    name: 'Professional 25-in-1 Precision Screwdriver Kit',
    slug: 'precision-screwdriver-kit',
    price: 850,
    category: 'Tools & Accessories',
    description: 'Magnetic screwdriver set for opening laptops, smartphones, and electronics.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'network-toolkit',
    name: 'Complete Network Toolkit (Crimper + Tester)',
    slug: 'network-toolkit',
    price: 1800,
    category: 'Tools & Accessories',
    description: 'Heavy-duty LAN cable crimping tool, wire stripper, RJ45 tester, and 20 modular plugs.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'thermal-paste',
    name: 'GD900 Thermal Paste Syringe (3g)',
    slug: 'gd900-thermal-paste',
    price: 400,
    category: 'Tools & Accessories',
    description: 'Premium CPU/GPU thermal grease compound for reducing PC overheating.',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80'
  }
];
