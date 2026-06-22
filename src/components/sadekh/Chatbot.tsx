'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';

export default function Chatbot() {
  const { lang, showChatbot, setShowChatbot, chatMessages, addChatMessage, setChatLoading, chatLoading, siteSettings } = useStore();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    const val = input.trim();
    if (!val || chatLoading) return;
    const userMsg = { role: 'user' as const, content: val };
    addChatMessage(userMsg);
    setInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: val, history: [...chatMessages, userMsg] }),
      });
      const data = await res.json();
      addChatMessage({ role: 'assistant', content: data.response || 'Désolé, une erreur est survenue.' });
    } catch {
      addChatMessage({ role: 'assistant', content: 'Désolé, je suis temporairement indisponible. Réessayez dans un instant.' });
    }
    setChatLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-[360px] max-h-[500px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">{t('chatbot.title', lang)}</div>
                <div className="text-xs text-primary-foreground/70">Assistant {siteSettings?.siteName || ''}</div>
              </div>
              <button onClick={() => setShowChatbot(false)} className="ml-auto w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ScrollArea className="flex-1 p-4 max-h-[350px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                placeholder={t('chatbot.placeholder', lang)}
                className="flex-1 h-9 text-sm"
                disabled={chatLoading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="icon" className="h-9 w-9" disabled={chatLoading} onClick={handleSend}>
                {chatLoading ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowChatbot(!showChatbot)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {showChatbot ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
