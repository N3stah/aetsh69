import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AetshChatWidget from '../components/aetsh69/AetshChatWidget';
import ErrorBoundary from '../components/ErrorBoundary';

export default function JudyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header />
      <main className="flex-1 bg-zinc-950">
        <iframe 
          src="/Judy.html" 
          title="Judy's Birthday Chart" 
          className="w-full h-[calc(100vh-128px)] border-0 block"
        />
      </main>
      <Footer />
      <ErrorBoundary>
        <AetshChatWidget />
      </ErrorBoundary>
    </div>
  );
}
