'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Send, Loader2, MessageSquare, ShieldCheck } from 'lucide-react';
import api from '@/app/lib/api';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  inquiryId: string;
  recipientName: string;
  recipientRole: string;
}

export default function ChatOverlay({
  isOpen,
  onClose,
  inquiryId,
  recipientName,
  recipientRole,
}: ChatOverlayProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any>(null);

  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  const fetchMessages = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get(`/messages/${inquiryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessages(res.data.messages || []);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const res = await api.post(
        '/messages',
        { inquiryId, message: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Initial fetch and polling setup
  useEffect(() => {
    if (!isOpen) return;

    fetchMessages(true);
    scrollToBottom();

    // Poll for new messages every 1.5 seconds
    pollingRef.current = setInterval(() => {
      fetchMessages(false);
    }, 1500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isOpen, inquiryId]);

  // Scroll to bottom when messages count changes
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full bg-slate-50 shadow-2xl flex flex-col z-10 animate-slide-in-right">
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-6 py-5 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
              {recipientName ? recipientName[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="text-sm font-bold capitalize flex items-center gap-1.5">
                {recipientName}
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {recipientRole === 'buyer' ? 'Buyer Contact' : 'Property Seller'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Conversation...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
              <p className="text-xs font-bold text-rose-700">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <div>
                <p className="text-xs font-bold text-slate-800">Start the conversation</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-1 max-w-[200px] mx-auto">Send a welcome message to begin negotiating your property deal</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
              const myUserId = currentUser?.id || currentUser?._id;
              const isMe = senderId && myUserId && senderId.toString() === myUserId.toString();
              return (
                <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-[#0F172A] text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    <p>{msg.message}</p>
                    <span className={`block text-[8px] mt-1 text-right ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="bg-white border-t border-slate-100 p-4 flex gap-2.5 items-center flex-shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-slate-50 border border-border/80 rounded-full px-5 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md transition-all flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
