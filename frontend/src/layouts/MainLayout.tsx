import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AetshChatWidget from '../components/aetsh69/AetshChatWidget';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AetshChatWidget />
    </div>
  );
}
