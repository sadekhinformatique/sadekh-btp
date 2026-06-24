'use client';

import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, Send, Inbox, Phone, ChevronRight } from 'lucide-react';

function formatDate(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MessagesSection() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/messages')
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await fetch('/api/admin/messages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, read: true }) });
    load();
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    await fetch('/api/admin/messages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const sendReply = async (msg: any) => {
    if (!replyText.trim()) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail: msg.sender?.email, propertyId: msg.propertyId, content: replyText.trim() }),
    });
    setReplyText('');
    alert('Réponse envoyée');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500">{messages.length} message{messages.length > 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Inbox className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Aucun message reçu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border overflow-hidden ${!msg.read ? 'border-l-4 border-l-emerald-500' : 'border-gray-200'}`}
            >
              <button
                onClick={() => {
                  setExpanded(expanded === msg.id ? null : msg.id);
                  if (!msg.read) markRead(msg.id);
                }}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50"
              >
                {msg.read ? <MailOpen className="w-5 h-5 text-gray-400 shrink-0" /> : <Mail className="w-5 h-5 text-emerald-600 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{msg.sender?.profile?.fullName || msg.sender?.name || 'Inconnu'}</span>
                    {msg.property && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 shrink-0">Bien</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{msg.content}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                  <ChevronRight className={`w-4 h-4 text-gray-400 mt-1 ml-auto transition-transform ${expanded === msg.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {expanded === msg.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.property && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg text-sm">
                      <span className="text-blue-500 font-medium">Bien lié :</span>
                      <span className="text-blue-700">{msg.property.title || msg.propertyId}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {msg.sender?.profile?.phone && (
                      <a href={`tel:${msg.sender.profile.phone}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600">
                        <Phone className="w-4 h-4" /> {msg.sender.profile.phone}
                      </a>
                    )}
                    <button onClick={() => deleteMsg(msg.id)} className="ml-auto p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Écrire une réponse..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onKeyDown={(e) => { if (e.key === 'Enter') sendReply(msg); }}
                    />
                    <button onClick={() => sendReply(msg)} className="px-3 py-2 bg-emerald-700 text-white rounded-lg text-sm hover:bg-emerald-800">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
