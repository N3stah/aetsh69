import { useEffect } from 'react';

export default function JudyPage() {
  useEffect(() => {
    // Poll for the chat widget's first message and change it for Judy
    const interval = setInterval(() => {
      const messages = document.querySelectorAll('div[class*="max-w-[85%]"]');
      if (messages.length > 0) {
        const firstMsg = messages[0] as HTMLElement;
        if (firstMsg.textContent?.includes("Habari")) {
          firstMsg.textContent = "Hey Judy, welcome to your page! Cheers to being 21! 🥂";
          clearInterval(interval);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-zinc-950">
      <iframe 
        src="/Judy.html" 
        title="Judy's Birthday Chart" 
        className="w-full h-[calc(100vh-64px)] border-0 block"
      />
    </div>
  );
}
