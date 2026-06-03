"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send, Plus, MessageCircle, Loader2, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Conversation {
  id: string;
  title?: string;
  isGroup: boolean;
  updatedAt: string;
  lastMessage: any;
  participants: { userId: string; name: string; role?: string }[];
}

interface Message {
  id: string;
  senderId: string;
  body: string;
  messageType: string;
  createdAt: string;
  readAt?: string;
}

export default function ParentMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewConv, setShowNewConv] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchConversations(); fetchMembers(); }, []);
  useEffect(() => { if (activeConv) fetchMessages(activeConv.id); }, [activeConv?.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function fetchConversations() {
    try { const r = await fetch("/api/messages/conversations", { credentials: "include" }); const d = await r.json(); setConversations(d.conversations || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }
  async function fetchMembers() {
    try { const r = await fetch("/api/members", { credentials: "include" }); const d = await r.json(); setMembers(d.members || []); }
    catch (e) { console.error(e); }
  }
  async function fetchMessages(convId: string) {
    try { const r = await fetch(`/api/messages/conversations/${convId}/messages`, { credentials: "include" }); const d = await r.json(); setMessages(d.messages || []); }
    catch (e) { console.error(e); }
  }
  async function startConversation(memberId: string) {
    try {
      const r = await fetch("/api/messages/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ participantIds: [memberId] }) });
      const d = await r.json();
      if (d.conversation) { setActiveConv(d.conversation); setShowNewConv(false); setShowSidebar(false); fetchConversations(); }
    } catch (e) { console.error(e); }
  }
  async function sendMessage() {
    if (!input.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const r = await fetch(`/api/messages/conversations/${activeConv.id}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ body: input.trim() }) });
      if (r.ok) { setInput(""); fetchMessages(activeConv.id); fetchConversations(); }
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  }

  const getName = (c: Conversation) => c.participants?.find(p => p.userId !== c.participants[0]?.userId)?.name || c.participants?.[0]?.name || c.title || "Chat";
  const getRole = (c: Conversation) => c.participants?.find(p => p.userId !== c.participants[0]?.userId)?.role || c.participants?.[0]?.role || "";

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-secondary animate-spin" /></div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden animate-fade-in">
      <div className={cn("w-full sm:w-[300px] border-r border-border-soft bg-white flex flex-col flex-shrink-0", activeConv && !showSidebar ? "hidden sm:flex" : "flex")}>
        <div className="p-4 border-b border-border-soft">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-text">Messages</h2>
            <button onClick={() => setShowNewConv(true)} className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center hover:bg-secondary-dark transition-colors"><Plus size={16} /></button>
          </div>
          <p className="text-xs text-text-muted">Message your children or school admin.</p>
        </div>
        {showNewConv && (
          <div className="p-4 border-b border-border-soft bg-secondary/5">
            <h3 className="text-sm font-bold text-text mb-3">New conversation</h3>
            {members.length === 0 ? <p className="text-xs text-text-muted">No contacts available.</p> : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {members.map((m: any) => (
                  <button key={m.id} onClick={() => startConversation(m.id)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-border-soft hover:border-secondary/30 transition-all text-left">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold", m.role === "ADMIN" || m.role === "TEACHER" ? "bg-gradient-to-br from-primary to-accent-purple" : "bg-gradient-to-br from-secondary to-secondary-dark")}>{(m.name || "U").charAt(0)}</div>
                    <div><p className="text-sm font-bold text-text">{m.name || "Unknown"}</p><p className="text-[10px] text-text-muted uppercase tracking-wider">{m.role}</p></div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowNewConv(false)} className="mt-3 text-xs font-bold text-text-muted hover:text-text">Cancel</button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center"><MessageCircle className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-50" /><p className="text-sm font-bold text-text-muted mb-1">No conversations yet</p><p className="text-xs text-text-muted">Tap + to start messaging.</p></div>
          ) : conversations.map((conv) => (
            <button key={conv.id} onClick={() => { setActiveConv(conv); setShowSidebar(false); }} className={cn("w-full p-4 border-b border-border-soft/50 flex items-center gap-3 transition-all text-left hover:bg-secondary/5", activeConv?.id === conv.id && "bg-secondary/5 border-l-4 border-l-secondary")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary-dark/20 flex items-center justify-center text-secondary text-sm font-bold flex-shrink-0">{getName(conv).charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between"><p className="text-sm font-bold text-text truncate">{getName(conv)}</p><span className="text-[10px] text-text-muted flex-shrink-0">{conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ""}</span></div>
                <p className="text-xs text-text-muted truncate">{conv.lastMessage?.body || getRole(conv)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className={cn("flex-1 flex flex-col", !activeConv && !showSidebar ? "hidden sm:flex" : "flex")}>
        {activeConv ? (
          <>
            <div className="p-4 border-b border-border-soft bg-white flex items-center gap-3">
              <button onClick={() => { setActiveConv(null); setShowSidebar(true); }} className="sm:hidden p-1.5 rounded-lg hover:bg-bg-main text-text-muted"><ChevronLeft size={18} /></button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary-dark/20 flex items-center justify-center text-secondary text-sm font-bold">{getName(activeConv).charAt(0)}</div>
              <div><p className="text-sm font-bold text-text">{getName(activeConv)}</p><p className="text-[10px] text-text-muted uppercase tracking-wider">{getRole(activeConv)}</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-main/50">
              {messages.length === 0 && <div className="flex items-center justify-center h-full"><p className="text-sm text-text-muted">No messages yet. Say hello!</p></div>}
              {messages.map((msg) => {
                const isMine = msg.senderId === activeConv.participants[0]?.userId;
                return (
                  <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] px-4 py-2.5 rounded-2xl text-sm", isMine ? "bg-secondary text-white rounded-br-md" : "bg-white border border-border-soft text-text rounded-bl-md shadow-sm")}>
                      <p>{msg.body}</p>
                      <p className={cn("text-[10px] mt-1", isMine ? "text-white/60" : "text-text-muted")}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-border-soft bg-white">
              <div className="flex items-center gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-3 rounded-2xl border border-border-soft bg-bg-main text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" />
                <button onClick={sendMessage} disabled={!input.trim() || sending} className="w-11 h-11 rounded-2xl bg-secondary text-white flex items-center justify-center hover:bg-secondary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-bg-main/30"><div className="text-center"><MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" /><p className="text-sm font-bold text-text-muted mb-1">Select a conversation</p><p className="text-xs text-text-muted">Choose from your contacts or start a new one.</p></div></div>
        )}
      </div>
    </div>
  );
}
