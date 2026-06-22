'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import type { Message } from '@/lib/types';

export default function MessagesView({ messages }: { messages: Message[] | undefined }) {
  const { lang, currentUser } = useStore();
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const unreadCount = (Array.isArray(messages) ? messages : []).filter(
    (m: Message) => !m.readAt && currentUser && m.receiverId === currentUser.id
  ).length;

  const conversations = (messages || []).reduce((acc: any, m: Message) => {
    const key = [m.senderId, m.receiverId].sort().join('-');
    if (!acc[key]) acc[key] = { partner: m.senderId === (currentUser?.id || '') ? m.receiver : m.sender, messages: [] };
    acc[key].messages.push(m);
    return acc;
  }, {});

  const handleSend = async () => {
    if (!msgText.trim()) return;
    setSendingMsg(true);
    try {
      await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msgText, receiverId: messages?.[0]?.receiverId || messages?.[0]?.senderId }),
      });
      setMsgText('');
    } catch {}
    setSendingMsg(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold">{t('messages.title', lang)}</h1>
        {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
      </div>
      <div className="grid md:grid-cols-3 gap-4 h-[500px]">
        <Card className="overflow-hidden">
          <ScrollArea className="h-full">
            {Object.values(conversations).map((conv: any, i: number) => (
              <button
                key={i}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {(conv.partner?.profile?.fullName || conv.partner?.name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{conv.partner?.profile?.fullName || conv.partner?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{conv.messages[conv.messages.length - 1]?.content}</div>
                </div>
              </button>
            ))}
            {Object.keys(conversations).length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm">{t('messages.empty', lang)}</div>
            )}
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="font-semibold">Conversation</div>
          </div>
          <ScrollArea className="flex-1 p-4">
            {(messages || []).map((m: Message) => (
              <div key={m.id} className={`flex mb-4 ${m.senderId === (currentUser?.id || '') ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.senderId === (currentUser?.id || '')
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              placeholder={t('messages.placeholder', lang)}
              className="flex-1"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="icon" disabled={sendingMsg || !msgText.trim()} onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
