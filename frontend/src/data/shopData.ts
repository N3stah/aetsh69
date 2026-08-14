export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number; // KSh
  category: string;
  description: string;
  image: string;
}

export const PRODUCTS_DATA: Product[] = [
  // Networking & Starlink
  {
    id: 'starlink-router',
    name: 'SpaceX Starlink Mesh Wi-Fi Router',
    slug: 'starlink-mesh-router',
    price: 28000,
    category: 'Networking & Starlink',
    description: 'Official standalone SpaceX Starlink Mesh router for expanding Wi-Fi range.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/starlink-router.jpg'
  },
  {
    id: 'tp-link-router',
    name: 'TP-Link AC1200 Dual-Band Router',
    slug: 'tp-link-ac1200-router',
    price: 3800,
    category: 'Networking & Starlink',
    description: 'Dual-band high-gain antennas for home and office fiber optic extensions.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/tp-link-router.jpg'
  },
  {
    id: 'pocket-mifi',
    name: '4G LTE Portable Pocket MiFi',
    slug: '4g-lte-pocket-mifi',
    price: 3200,
    category: 'Networking & Starlink',
    description: 'Unlocked mobile Wi-Fi hotspot supporting Safaricom, Airtel, and Faiba 4G SIM cards.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/pocket-mifi.jpg'
  },
  {
    id: 'cat6-cable',
    name: 'Cat6 Outdoor LAN Ethernet Cable (Per Meter)',
    slug: 'cat6-outdoor-cable',
    price: 50,
    category: 'Networking & Starlink',
    description: 'Pure copper weather-resistant Cat6 network cable cut to custom length.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/cat6-cable.jpg'
  },
  {
    id: 'cat6-patch-cord',
    name: 'Pre-Crimped Cat6 Patch Cord (10m)',
    slug: 'cat6-patch-cord-10m',
    price: 650,
    category: 'Networking & Starlink',
    description: 'Factory-molded RJ45 Ethernet patch cable for high-speed routers and PCs.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/cat6-patch-cord.jpg'
  },
  // CCTV & Security
  {
    id: 'v380-camera',
    name: 'V380 Mini Wireless Smart CCTV Camera',
    slug: 'v380-smart-cctv',
    price: 2500,
    category: 'CCTV & Security',
    description: 'HD night-vision Wi-Fi camera with 360° motion tracking and two-way audio.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/v380-camera.jpg'
  },
  // Streaming & Media
  {
    id: 'firestick-4k',
    name: 'Amazon Fire TV Stick 4K Max',
    slug: 'firestick-4k-max',
    price: 7000,
    category: 'Streaming & Media',
    description: 'Ultra HD streaming media player pre-configured for IPTV, Stremio, and Netflix.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/firestick-4k.jpg'
  },
  {
    id: 'blank-dvds',
    name: 'Blank DVD-R Discs (Spindle 10-Pack)',
    slug: 'blank-dvd-r-10-pack',
    price: 450,
    category: 'Streaming & Media',
    description: '4.7GB blank DVD-R discs for data archiving, media burning, and system backups.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/blank-dvds.jpg'
  },
  // PC Upgrades
  {
    id: 'ddr4-8gb-ram',
    name: '8GB DDR4 2666/3200MHz RAM Module',
    slug: '8gb-ddr4-ram',
    price: 3200,
    category: 'PC Upgrades',
    description: 'High-performance SODIMM / DIMM RAM module for speeding up multitasking.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/ddr4-ram.jpg'
  },
  {
    id: '256gb-nvme-ssd',
    name: '256GB M.2 NVMe Solid State Drive',
    slug: '256gb-nvme-ssd',
    price: 3800,
    category: 'PC Upgrades',
    description: 'High-speed internal SSD with boot speeds up to 2100MB/s for laptops and PCs.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/nvme-ssd.jpg'
  },
  // Tools & Accessories
  {
    id: 'precision-screwdriver-kit',
    name: 'Professional 25-in-1 Precision Screwdriver Kit',
    slug: 'precision-screwdriver-kit',
    price: 850,
    category: 'Tools & Accessories',
    description: 'Magnetic screwdriver set for opening laptops, smartphones, and electronics.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/screwdriver-kit.jpg'
  },
  {
    id: 'network-toolkit',
    name: 'Complete Network Toolkit (Crimper + Tester)',
    slug: 'network-toolkit',
    price: 1800,
    category: 'Tools & Accessories',
    description: 'Heavy-duty LAN cable crimping tool, wire stripper, RJ45 tester, and 20 modular plugs.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/network-toolkit.jpg'
  },
  {
    id: 'thermal-paste',
    name: 'GD900 Thermal Paste Syringe (3g)',
    slug: 'gd900-thermal-paste',
    price: 400,
    category: 'Tools & Accessories',
    description: 'Premium CPU/GPU thermal grease compound for reducing PC overheating.',
    image: 'https://res.cloudinary.com/dxt/image/upload/v1/aetsh69/thermal-paste.jpg'
  }
];
