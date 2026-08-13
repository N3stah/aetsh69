# Deployment & Orchestration Strategy
Frontend is hosted on Vercel (aetsh69.vercel.app & smartshamba.vercel.app) with global CDN distribution. The backend is deployed on Render.com using Docker containers. The dynamic edge node (aetsh69.duckdns.org) routes traffic. The architecture uses Nginx reverse proxy, SSL termination, and automated health checks to ensure 99.9% uptime.
