export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: 'AI & ML' | 'Cybersecurity' | 'Networking & IoT' | 'Hackathons & Bootcamps';
  fileUrl: string;
  format: 'PDF' | 'Image';
  credentialId?: string;
  verificationUrl?: string;
}

export const CERTIFICATES_DATA: Certificate[] = [
  {
    id: 'ai-ml-intermediate',
    title: 'Intermediate AI & Machine Learning',
    issuer: 'University of Nairobi — KITI',
    date: 'April 22, 2026',
    category: 'AI & ML',
    fileUrl: '/certificates/intermediate-ai-ml.pdf',
    format: 'PDF'
  },
  {
    id: 'ai-ml-foundation',
    title: 'Foundation AI & Machine Learning',
    issuer: 'University of Nairobi — KITI',
    date: 'April 19, 2026',
    category: 'AI & ML',
    fileUrl: '/certificates/foundation-ai-ml.pdf',
    format: 'PDF'
  },
  {
    id: 'blockchain-foundation',
    title: 'Blockchain Foundation',
    issuer: 'University of Nairobi — KITI',
    date: 'April 24, 2026',
    category: 'Hackathons & Bootcamps',
    fileUrl: '/certificates/blockchain-foundation.pdf',
    format: 'PDF'
  },
  {
    id: 'cybersecurity-foundation',
    title: 'Cybersecurity Foundation',
    issuer: 'University of Nairobi — KITI',
    date: 'April 24, 2026',
    category: 'Cybersecurity',
    fileUrl: '/certificates/cybersecurity-foundation.pdf',
    format: 'PDF'
  },
  {
    id: 'cisco-packet-tracer',
    title: 'Getting Started with Cisco Packet Tracer',
    issuer: 'Cisco Networking Academy',
    date: 'March 17, 2026',
    category: 'Networking & IoT',
    fileUrl: '/certificates/cisco-packet-tracer.pdf',
    format: 'PDF',
    verificationUrl: 'https://www.credly.com/badges/your-cisco-badge'
  },
  {
    id: 'iot-foundation',
    title: 'Internet of Things (IoT) Foundation',
    issuer: 'University of Nairobi — KITI',
    date: 'April 23, 2026',
    category: 'Networking & IoT',
    fileUrl: '/certificates/iot-foundation.pdf',
    format: 'PDF'
  },
  {
    id: 'kiti-bootcamp',
    title: 'KITI Program Bootcamp II (Emerging Tech)',
    issuer: 'University of Nairobi C4D Lab / KITI',
    date: 'April 24, 2026',
    category: 'Hackathons & Bootcamps',
    fileUrl: '/certificates/kiti-bootcamp.jpeg',
    format: 'Image'
  },
  {
    id: 'kiti-hackathon',
    title: 'KITI Project Hackathon II',
    issuer: 'University of Nairobi C4D Lab / KITI',
    date: 'April 30, 2026',
    category: 'Hackathons & Bootcamps',
    fileUrl: '/certificates/kiti-hackathon.jpeg',
    format: 'Image'
  }
];
