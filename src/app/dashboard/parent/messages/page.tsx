"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send, Plus, MessageCircle, Loader2, ChevronLeft,
  User, Search, Sparkles
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myId = useRef<string>("");

  useEffect(() => {
    // Fetch current user ID
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data?.user?.id) myId.current = data.user.id;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
    }
  }, [activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/messages/conversations", { credentials: "include" });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (e) {
      console.error("[MSG] Fetch conversations error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers() {
    try {
      const res = await fetch("/api/members", { credentials: "include" });
      const data = await res.json();
      setMembers(data.members || []);
    } catch (e) {
      console.error("[MSG] Fetch members error:", e);
    }
  }

  async function fetchMessages(convId: string) {
    try {
      const res = await fetch(`/api/messages/conversations/${convId}/messages`, { credentials: "include" });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error("[MSG] Fetch messages error:", e);
    }
  }

  async function startConversation(memberId: string) {
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ participantIds: [memberId] }),
      });
      const data = await res.json();
      if (data.conversation) {
        setActiveConv(data.conversation);
        setShowNewConv(false);
        setShowSidebar(false);
        fetchConversations();
      }
    } catch (e) {
      console.error("[MSG] Start conversation error:", e);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/conversations/${activeConv.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: input.trim() }),
      });
      if (res.ok) {
        setInput("");
        fetchMessages(activeConv.id);
        fetchConversations();
      }
    } catch (e) {
      console.error("[MSG] Send error:", e);
    } finally {
      setSending(false);
    }
  }

  const getParticipantName = (conv: Conversation) => {
    const other = conv.participants?.find(p => p.userId !== myId.current);
    return other?.name || conv.title || "Conversation";
  };

  const getParticipantRole = (conv: Conversation) => {
    const other = conv.participants?.find(p => p.userId !== myId.current);
    return other?.role || "";
  };

  const filteredConversations = searchQuery
    ? conversations.filter(c => getParticipantName(c).toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className={`w-full sm:w-[300px] border-r border-slate-200/50 bg-white flex flex-col flex-shrink-0 ${activeConv && !showSidebar ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-slate-200/50 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Messages</h2>
            <button
              onClick={() => setShowNewConv(true)}
              className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* New conversation */}
        {showNewConv && (
          <div className="p-4 border-b border-slate-200/50 bg-indigo-50/50">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Message your child</h3>
            {members.length === 0 ? (
              <p className="text-xs text-slate-500">No linked children found. Link a child account first.</p>
            ) : (
              <div className="space-y-2">
                {members.filter(m => m.role === "LEARNER").map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => startConversation(m.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/60 hover:border-indigo-300 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {(m.name || "C").charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{m.name || "Child"}</p>
                      <p className="text-[10px] text-slate-500">Tap to start conversation</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowNewConv(false)} className="mt-3 text-xs font-bold text-slate-500 hover:text-slate-700">
              Cancel
            </button>
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 mb-1">No conversations yet</p>
              <p className="text-xs text-slate-400">Tap + to message your child</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setActiveConv(conv); setShowSidebar(false); }}
                className={`w-full p-4 border-b border-slate-100/50 flex items-center gap-3 transition-all text-left hover:bg-indigo-50/50 ${
                  activeConv?.id === conv.id && "bg-indigo-50 border-l-4 border-l-indigo-500"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                  {getParticipantName(conv).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 truncate">{getParticipantName(conv)}</p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {conv.lastMessage?.body || getParticipantRole(conv) || "No messages yet"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message area */}
      <div className={`flex-1 flex flex-col ${!activeConv && !showSidebar ? "hidden sm:flex" : "flex"}`}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200/50 bg-white flex items-center gap-3">
              <button onClick={() => { setActiveConv(null); setShowSidebar(true); }} className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <ChevronLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                {getParticipantName(activeConv).charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{getParticipantName(activeConv)}</p>
                <p className="text-[10px] text-slate-500">{getParticipantRole(activeConv)}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Start the conversation!</p>
                    <p className="text-xs text-slate-400 mt-1">Send a message to your child</p>
                  </div>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.senderId === myId.current;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine
                        ? "bg-indigo-500 text-white rounded-br-md"
                        : "bg-white border border-slate-200/60 text-slate-800 rounded-bl-md shadow-sm"
                    }`}>
                      <p>{msg.body}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-slate-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200/50 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/30">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 mb-1">Select a conversation</p>
              <p className="text-xs text-slate-400">Choose from your contacts or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
