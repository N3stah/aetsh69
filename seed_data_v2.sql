-- Seed Blog Categories FIRST
INSERT INTO blog_categories (name, slug, description) VALUES
('Engineering', 'engineering', 'Software architecture, system design, and engineering practices.'),
('AI & ML', 'ai-ml', 'Artificial intelligence, machine learning, and LLM applications.'),
('Business', 'business', 'Entrepreneurship, tech business models, and African markets.'),
('Design', 'design', 'UI/UX, visual systems, and anti-generic design philosophy.');

-- Seed Blog Tags
INSERT INTO blog_tags (name, slug) VALUES
('React', 'react'), ('FastAPI', 'fastapi'), ('PostgreSQL', 'postgresql'), ('Docker', 'docker'),
('AI', 'ai'), ('IoT', 'iot'), ('Security', 'security'), ('Nairobi', 'nairobi');

-- Seed Product Categories FIRST
INSERT INTO product_categories (name, slug, description) VALUES
('Hardware', 'hardware', 'Physical IoT devices, sensors, and kits.'),
('Services', 'services', 'Consultation and technical service packages.'),
('Digital', 'digital', 'Software tools, templates, and digital assets.');

-- Seed Portfolio Projects
INSERT INTO projects (title, slug, tagline, description, content, tech_stack, links, featured, sort_order, start_date, is_ongoing) VALUES
('SmartShamba', 'smartshamba', 'IoT-powered agriculture monitoring for small-scale farms.', 'SmartShamba is an end-to-end IoT platform that helps Kenyan smallholder farmers monitor soil moisture, weather patterns, and crop health via a mobile dashboard.', 'Built with React, FastAPI, and ESP32 microcontrollers. The system uses MQTT for real-time sensor data transmission and PostgreSQL for time-series storage.', '["React", "FastAPI", "PostgreSQL", "ESP32", "MQTT"]', '{"github": "https://github.com/N3stah/smartshamba", "live": "https://smartshamba.aetsh69.com"}', TRUE, 1, '2024-01-15', TRUE),
('AETSH-69 Ecosystem', 'aetsh69-ecosystem', 'Personal tech ecosystem — portfolio, blog, shop, AI concierge, and more.', 'A full-stack personal platform built to showcase engineering work, sell services, and host an AI concierge.', 'Features a dark-mode editorial design system with Fraunces serif headings and General Sans body text. Real-time chat via WebSocket, Dockerized microservices, and pgvector for AI knowledge retrieval.', '["React", "Tailwind", "FastAPI", "PostgreSQL", "Redis", "Docker"]', '{"github": "https://github.com/N3stah/personal-tech-ecosystem", "live": "https://aetsh69.com"}', TRUE, 2, '2024-03-01', TRUE),
('Nairobi CCTV Network', 'nairobi-cctv', 'City-wide surveillance network design and deployment.', 'Designed and deployed a 200-camera IP surveillance network across Nairobi commercial districts.', 'Includes Hikvision IP cameras, Milestone NVR setup, remote monitoring via mobile app, and AI-powered motion detection using OpenCV and Python.', '["Hikvision", "Milestone", "Python", "OpenCV"]', '{"live": "https://cctv.aetsh69.com"}', FALSE, 3, '2023-06-01', FALSE),
('Chemsha Bongo', 'chemsha-bongo', 'Swahili word puzzle game with daily challenges.', 'A browser-based word puzzle game built for East African audiences.', 'Features daily challenges, Swahili dictionary integration, shareable score cards, and a dark-mode UI. Built with TypeScript and Canvas API.', '["TypeScript", "Canvas API", "FastAPI", "Redis"]', '{"github": "https://github.com/N3stah/chemsha-bongo", "live": "https://chemsha.aetsh69.com"}', FALSE, 4, '2024-05-20', TRUE);

-- Seed Blog Posts (now categories exist)
INSERT INTO blog_posts (title, slug, excerpt, content, category_id, status, featured, reading_time, published_at) VALUES
('Building SmartShamba: From Field to Cloud', 'building-smartshamba', 'How I built an IoT agriculture platform for Kenyan smallholder farmers using React, FastAPI, and ESP32 microcontrollers.', 'Full article content about SmartShamba architecture, challenges with rural connectivity, and lessons learned from deploying hardware in the field.', (SELECT id FROM blog_categories WHERE slug='engineering'), 'published', TRUE, 8, NOW()),
('Why I Rejected the Default Web Aesthetic', 'rejecting-default-web', 'A manifesto against AI-generated design slop and the mathematically aggregated web styles of 2020-2024.', 'Deep dive into the "Museum Gallery Wall" philosophy, the 60-30-10 color system, and why bespoke design matters for personal brands.', (SELECT id FROM blog_categories WHERE slug='design'), 'published', TRUE, 6, NOW()),
('Deploying CCTV at Scale in Nairobi', 'nairobi-cctv-scale', 'Lessons from designing a 200-camera surveillance network across Nairobi commercial districts.', 'Technical breakdown of IP camera selection, NVR architecture, bandwidth calculations, and AI motion detection integration.', (SELECT id FROM blog_categories WHERE slug='engineering'), 'published', FALSE, 10, NOW()),
('AETSH-69: Building an AI Concierge', 'aetsh69-ai-concierge', 'How I built a personal AI assistant that knows my entire ecosystem and can answer questions about my work.', 'Architecture of the RAG system, knowledge base construction, prompt engineering, and integration with the FastAPI backend.', (SELECT id FROM blog_categories WHERE slug='ai-ml'), 'published', FALSE, 7, NOW());

-- Link posts to tags
INSERT INTO blog_post_tags (post_id, tag_id) VALUES
((SELECT id FROM blog_posts WHERE slug='building-smartshamba'), (SELECT id FROM blog_tags WHERE slug='react')),
((SELECT id FROM blog_posts WHERE slug='building-smartshamba'), (SELECT id FROM blog_tags WHERE slug='fastapi')),
((SELECT id FROM blog_posts WHERE slug='building-smartshamba'), (SELECT id FROM blog_tags WHERE slug='iot')),
((SELECT id FROM blog_posts WHERE slug='rejecting-default-web'), (SELECT id FROM blog_tags WHERE slug='react')),
((SELECT id FROM blog_posts WHERE slug='rejecting-default-web'), (SELECT id FROM blog_tags WHERE slug='docker')),
((SELECT id FROM blog_posts WHERE slug='nairobi-cctv-scale'), (SELECT id FROM blog_tags WHERE slug='security')),
((SELECT id FROM blog_posts WHERE slug='aetsh69-ai-concierge'), (SELECT id FROM blog_tags WHERE slug='ai')),
((SELECT id FROM blog_posts WHERE slug='aetsh69-ai-concierge'), (SELECT id FROM blog_tags WHERE slug='fastapi'));

-- Seed Products (now categories exist)
INSERT INTO products (name, slug, short_description, description, price_kes, price_usd, stock_quantity, is_featured, is_active, tags, category_id) VALUES
('SmartShamba Starter Kit', 'smartshamba-kit', 'Complete IoT kit for small-scale farm monitoring.', 'Includes soil moisture sensor, weather station, and 6-month dashboard access. Ships assembled from Nairobi.', 12500, 95, 50, TRUE, TRUE, '["IoT", "Agriculture", "Kenya"]', (SELECT id FROM product_categories WHERE slug='hardware')),
('Consultation Hour', 'consultation-hour', 'One hour of dedicated technical consultation.', 'Architecture review, debugging, or career advice. Booked via Calendly. Remote or in-person within Nairobi.', 5000, 38, 999, FALSE, TRUE, '["Consultation", "Engineering"]', (SELECT id FROM product_categories WHERE slug='services')),
('Nairobi CCTV Package', 'nairobi-cctv-package', '4-camera HD IP surveillance package with NVR.', 'Remote viewing setup and 1-year support. Installation included within Nairobi. Hikvision cameras.', 45000, 340, 20, TRUE, TRUE, '["Security", "CCTV", "Nairobi"]', (SELECT id FROM product_categories WHERE slug='services')),
('AETSH-69 Source Code', 'aetsh69-source', 'Full source code access to the AETSH-69 ecosystem.', 'React frontend, FastAPI backend, Docker compose, and documentation. License: MIT.', 15000, 115, 100, FALSE, TRUE, '["Source Code", "React", "FastAPI"]', (SELECT id FROM product_categories WHERE slug='digital'));

-- Seed Services
INSERT INTO services (title, slug, description, icon, features, price) VALUES
('CCTV Installation', 'cctv', 'Professional security camera setup for homes and businesses. HD, night vision, and remote monitoring.', 'tv', '["HD cameras", "Night vision", "Remote access", "Cloud storage"]', 'From KES 25,000'),
('Networking', 'networking', 'Structured cabling, Wi-Fi optimization, and network infrastructure for reliable connectivity.', 'wifi', '["Structured cabling", "Wi-Fi 6", "VPN setup", "Network security"]', 'From KES 15,000'),
('IT Consultation', 'it-consultation', 'Strategic technology advice for startups and SMEs. Architecture, stack selection, and scaling.', 'briefcase', '["Tech strategy", "Stack audits", "Cloud migration", "DevOps"]', 'KES 5,000/hr'),
('Cyber Services', 'cyber', 'Penetration testing, security audits, and compliance guidance for digital assets.', 'shield', '["Pen testing", "Security audits", "Compliance", "Incident response"]', 'Custom quote');

-- Seed Arcade Games
INSERT INTO arcade_games (title, slug, description, genre, status) VALUES
('Snake 69', 'snake-69', 'Classic snake with a dark-mode twist and local leaderboard.', 'Arcade', 'live'),
('Nairobi Drift', 'nairobi-drift', 'Top-down racer through Nairobi streets. Built with Canvas API.', 'Racing', 'wip'),
('Chemsha Bongo', 'chemsha-bongo', 'Swahili word puzzle. Daily challenges, shareable scores.', 'Puzzle', 'live');
