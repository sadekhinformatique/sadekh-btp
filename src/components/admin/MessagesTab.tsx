'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail, MailOpen, Phone, ChevronRight, Send, CheckCircle2, Trash2, HomeIcon, Inbox,
} from 'lucide-react';
import { formatDateTime } from './constants';

interface Props {
  messages: any[];
  msgsLoading: boolean;
  expandedMsgId: string | null;
  setExpandedMsgId: (id: string | null) => void;
  replyTexts: Record<string, string>;
  setReplyTexts: (v: Record<string, string>) => void;
  markAsRead: any;
  deleteMessage: any;
  replyToMessage: any;
}

export default function MessagesTab(props: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Gérez les demandes de contact</p>
      </div>

      {props.msgsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (!props.messages || props.messages.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucun message reçu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {props.messages.map((msg: any) => (
            <Card key={msg.id} className={`overflow-hidden ${!msg.read ? 'border-l-4 border-l-green-600' : ''}`}>
              <CardContent className="p-4">
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => {
                    if (!msg.read) props.markAsRead.mutate(msg.id);
                    props.setExpandedMsgId(props.expandedMsgId === msg.id ? null : msg.id);
                  }}
                >
                  <div className={`mt-0.5 ${!msg.read ? 'text-green-600' : 'text-gray-400'}`}>
                    {!msg.read ? <Mail className="h-5 w-5" /> : <MailOpen className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{msg.name || msg.senderName || 'Anonyme'}</span>
                        {!msg.read && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {msg.subject || msg.message || 'Sans objet'}
                    </p>
                    {msg.propertyId && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        <HomeIcon className="h-3 w-3 mr-1" />
                        Bien lié
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${props.expandedMsgId === msg.id ? 'rotate-90' : ''}`} />
                </div>

                <AnimatePresence>
                  {props.expandedMsgId === msg.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Separator className="my-3" />
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {msg.email && (
                            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{msg.email}</span>
                          )}
                          {msg.phone && (
                            <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{msg.phone}</span>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message || msg.content}</p>

                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Écrire une réponse..."
                            value={props.replyTexts[msg.id] || ''}
                            onChange={(e) => props.setReplyTexts({ ...props.replyTexts, [msg.id]: e.target.value })}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && props.replyTexts[msg.id]?.trim()) {
                                props.replyToMessage.mutate({
                                  propertyId: msg.propertyId || '',
                                  content: props.replyTexts[msg.id],
                                  toEmail: msg.email || '',
                                });
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            style={{ backgroundColor: '#1B5E20' }}
                            className="text-white hover:opacity-90 shrink-0"
                            onClick={() => props.replyToMessage.mutate({
                              propertyId: msg.propertyId || '',
                              content: props.replyTexts[msg.id],
                              toEmail: msg.email || '',
                            })}
                            disabled={!props.replyTexts[msg.id]?.trim() || props.replyToMessage.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => props.markAsRead.mutate(msg.id)}
                            disabled={msg.read}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Marquer comme lu
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => props.deleteMessage.mutate(msg.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
