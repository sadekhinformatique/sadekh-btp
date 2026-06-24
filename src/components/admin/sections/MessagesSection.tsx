'use client';

import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, Send, Inbox, Phone, ChevronRight, Reply, MessageSquare } from 'lucide-react';

function fmtDate(d: string) {
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail: msg.sender?.email, propertyId: msg.propertyId, content: replyText.trim() }),
    });
    setReplyText('');
    alert('Réponse envoyée');
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Messages</h1>
          <p className="text-sm text-green-600 mt-1">
            {messages.length} message{messages.length > 1 ? 's' : ''}
            {unread > 0 && <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{unread} non lu{unread > 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-green-100/50" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-green-100/70 p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-green-600 font-medium">Aucun message reçu</p>
          <p className="text-sm text-green-400 mt-1">Les messages des visiteurs apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isExpanded = expanded === msg.id;
            return (
              <div key={msg.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  !msg.read ? 'border-l-4 border-l-emerald-500 border-green-100/70' : 'border-green-100/70'
                } ${isExpanded ? 'shadow-md' : 'hover:shadow-md'}`}
              >
                <button
                  onClick={() => { setExpanded(isExpanded ? null : msg.id); if (!msg.read) markRead(msg.id); }}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-green-50/40 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.read ? 'bg-gray-50 text-gray-400' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {msg.read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${!msg.read ? 'font-bold text-green-900' : 'font-medium text-green-700'}`}>
                        {msg.sender?.profile?.fullName || msg.sender?.name || 'Inconnu'}
                      </span>
                      {msg.property && (
                        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Bien lié</span>
                      )}
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${!msg.read ? 'text-green-700' : 'text-green-500'}`}>
                      {msg.content}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-green-400">{fmtDate(msg.createdAt)}</p>
                    <ChevronRight className={`w-4 h-4 text-green-400 mt-1 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-green-100 pt-3 space-y-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl p-4 border border-green-100/50">
                      <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>

                    {msg.property && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-sm border border-amber-100/50">
                        <MessageSquare className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-amber-700 font-medium">Bien :</span>
                        <span className="text-amber-600">{msg.property.title || msg.propertyId}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {msg.sender?.profile?.phone && (
                        <a href={`tel:${msg.sender.profile.phone}`}
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl text-sm text-green-700 hover:bg-green-50 transition-colors">
                          <Phone className="w-4 h-4 text-green-500" />
                          {msg.sender.profile.phone}
                        </a>
                      )}
                      <button onClick={() => deleteMsg(msg.id)}
                        className="ml-auto p-2.5 hover:bg-red-50 rounded-xl transition-colors text-green-400 hover:text-red-500 border border-transparent hover:border-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Écrire une réponse..."
                        className="flex-1 px-4 py-2.5 bg-white border border-green-200 rounded-xl text-sm text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        onKeyDown={(e) => { if (e.key === 'Enter') sendReply(msg); }}
                      />
                      <button onClick={() => sendReply(msg)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl text-sm font-medium hover:from-green-800 hover:to-green-700 transition-all shadow-md shadow-green-200">
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Envoyer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
