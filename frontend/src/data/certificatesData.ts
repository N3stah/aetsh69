export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: 'AI & ML' | 'Cybersecurity' | 'Networking & IoT' | 'Hackathons & Bootcamps';
  filePath: string;
  format: 'PDF' | 'Image';
}

export const CERTIFICATES_DATA: Certificate[] = [
  {
    id: 'ai-ml-intermediate',
    title: 'Intermediate AI & Machine Learning',
    issuer: 'University of Nairobi — KITI',
    date: 'April 22, 2026',
    category: 'AI & ML',
    filePath: '/assets_achieved/Certificates/PDF_Certificates/AI_amp_ML_Intermediate_Certificate.pdf',
    format: 'PDF'
  },
  {
    id: 'ai-ml-foundation',
    title: 'Foundation AI & Machine Learning',
    issuer: 'University of Nairobi — KITI',
    date: 'April 19, 2026',
    category: 'AI & ML',
    filePath: '/assets_achieved/Certificates/PDF_Certificates/AI_COMPLETION_CERTIFICATE.pdf',
    format: 'PDF'
  },
  {
    id: 'blockchain-foundation',
    title: 'Blockchain Foundation',
    issuer: 'University of Nairobi — KITI',
    date: 'April 24, 2026',
    category: 'Hackathons & Bootcamps',
    filePath: '/assets_achieved/Certificates/PDF_Certificates/Completion_Certificate.pdf',
    format: 'PDF'
  },
  {
    id: 'cybersecurity-foundation',
    title: 'Cybersecurity Foundation',
    issuer: 'University of Nairobi — KITI',
    date: 'April 24, 2026',
    category: 'Cybersecurity',
    filePath: '/assets_achieved/Certificates/PDF_Certificates/Certificate_of_Completion.pdf',
    format: 'PDF'
  },
  {
    id: 'cisco-packet-tracer',
    title: 'Getting Started with Cisco Packet Tracer',
    issuer: 'Cisco Networking Academy',
    date: 'March 17, 2026',
    category: 'Networking & IoT',
    filePath: '/assets_achieved/Certificates/PDF_Certificates/Getting_Started_with_Cisco_Packet_Tracer_certificate_markmanoti69-gmail-com_90786363-26c5-41cc-a4a8-3ad3815c7333.pdf',
    format: 'PDF'
  },
  {
    id: 'iot-foundation',
    title: 'Internet of Things (IoT) Foundation',
    issuer: 'University of Nairobi — KITI',
    date: 'April 23, 2026',
    category: 'Networking & IoT',
    filePath: '/assets_achieved/Certificates/PDF_Certificates/IOT_-_BASIC_LEVEL_CERTIFICATE.pdf',
    format: 'PDF'
  },
  {
    id: 'kiti-bootcamp',
    title: 'KITI Program Bootcamp II (Emerging Tech)',
    issuer: 'University of Nairobi C4D Lab / KITI',
    date: 'April 24, 2026',
    category: 'Hackathons & Bootcamps',
    filePath: '/assets_achieved/Certificates/Image_Certificates/KITI_Bootcamp.jpeg',
    format: 'Image'
  },
  {
    id: 'kiti-hackathon',
    title: 'KITI Project Hackathon II',
    issuer: 'University of Nairobi C4D Lab / KITI',
    date: 'April 30, 2026',
    category: 'Hackathons & Bootcamps',
    filePath: '/assets_achieved/Certificates/Image_Certificates/KITI_Hackathon.jpeg',
    format: 'Image'
  }
];
