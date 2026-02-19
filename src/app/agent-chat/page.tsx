"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  agentLogin,
  getAgentMe,
  getAgentConversations,
  getAgentMessages,
  sendAgentMessage,
  claimConversation,
  closeConversation,
  type Conversation,
  type ChatMsg,
} from "@/lib/chatApi";
import {
  ChatSocketClient,
  type ChatMessagePayload,
  type ChatNewConversationPayload,
} from "@/lib/socket";

const QUICK_REPLIES = [
  { label: "Greeting", text: "Hi there! Welcome to Varntix. How can I help you today?" },
  { label: "Hold on", text: "Please hold on for a moment while I look into this for you." },
  { label: "Verify account", text: "For security purposes, could you please verify your account email?" },
  { label: "Promo 10%", text: "Great news! Use code VARNTIX10 to get 10% off your next transaction." },
  { label: "Promo 15%", text: "Exclusive offer just for you! Use code SAVE15 for 15% off today." },
  { label: "Free trial", text: "Did you know? You can try our premium features free for 7 days. Want me to set that up?" },
  { label: "Upgrade", text: "Upgrade your plan today and unlock advanced trading tools with priority support!" },
  { label: "Refer a friend", text: "Love Varntix? Refer a friend and both of you earn bonus credits!" },
  { label: "Issue resolved", text: "I'm glad we could resolve that for you! Is there anything else I can help with?" },
  { label: "Closing", text: "Thank you for reaching out. Have a great day! Feel free to chat with us anytime." },
];

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("varntix_agent_token");
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(d: string) {
  const dt = new Date(d);
  const day = dt.getDate().toString().padStart(2, "0");
  const mon = (dt.getMonth() + 1).toString().padStart(2, "0");
  const hr = dt.getHours().toString().padStart(2, "0");
  const min = dt.getMinutes().toString().padStart(2, "0");
  return `${day}/${mon} ${hr}:${min}`;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logging, setLogging] = useState(false);
  const [validating, setValidating] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ChatSocketClient | null>(null);

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setValidating(false);
        return;
      }
      try {
        const agentData = await getAgentMe(storedToken);
        setToken(storedToken);
        setAgentName(agentData.displayName);
      } catch {
        localStorage.removeItem("varntix_agent_token");
      }
      setValidating(false);
    };
    validateToken();
  }, []);

  const handleLogin = async () => {
    setLogging(true);
    setLoginError("");
    try {
      const res = await agentLogin(username, password);
      setToken(res.token);
      setAgentName(res.agent.displayName);
      localStorage.setItem("varntix_agent_token", res.token);
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLogging(false);
    }
  };

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const convs = await getAgentConversations(token);
      setConversations(convs);
    } catch (err: any) {
      if (err.status === 401) {
        setToken(null);
        localStorage.removeItem("varntix_agent_token");
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadConversations();
      const interval = setInterval(loadConversations, 15000);
      return () => clearInterval(interval);
    }
  }, [token, loadConversations]);

  useEffect(() => {
    if (!token) return;
    const sock = new ChatSocketClient();
    sock.connect();
    sock.subscribeChatAgents();
    socketRef.current = sock;

    sock.onNewConversation(() => loadConversations());
    sock.onConversationUpdated(() => loadConversations());
    sock.onChatMessage((p: ChatMessagePayload) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === p.id)) return prev;
        if (prev.length > 0 && prev[0].conversationId !== p.conversationId) return prev;
        return [...prev, { _id: p.id, conversationId: p.conversationId, senderType: p.senderType, body: p.body, read: false, createdAt: p.createdAt } as ChatMsg];
      });
      scrollBottom();
    });

    return () => sock.disconnect();
  }, [token, loadConversations, scrollBottom]);

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setShowInfo(false);
    setShowQuickReplies(false);
    if (!token) return;
    try {
      const msgs = await getAgentMessages(token, conv._id);
      setMessages(msgs);
      scrollBottom();
      socketRef.current?.subscribeChat(conv._id);
    } catch {}
  };

  const handleClaim = async () => {
    if (!token || !activeConv) return;
    try {
      await claimConversation(token, activeConv._id);
      loadConversations();
      setActiveConv((prev) => prev ? { ...prev, status: "active" } : prev);
    } catch {}
  };

  const handleClose = async () => {
    if (!token || !activeConv) return;
    try {
      await closeConversation(token, activeConv._id);
      loadConversations();
      setActiveConv((prev) => prev ? { ...prev, status: "closed" } : prev);
    } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || !token || !activeConv || sending) return;
    const body = input.trim();
    setInput("");
    setSending(true);
    setShowQuickReplies(false);
    try {
      const msg = await sendAgentMessage(token, activeConv._id, body);
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollBottom();
    } catch {}
    setSending(false);
  };

  const useQuickReply = (text: string) => {
    setInput(text);
    setShowQuickReplies(false);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("varntix_agent_token");
    setActiveConv(null);
    setMessages([]);
    setConversations([]);
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="text-sm text-[#FFFFFF60] font-ui">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#111113] rounded-2xl border border-[#FFFFFF14] p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Image width={32} height={32} src="/assets/Group 1597884980.svg" alt="Varntix" />
            <h1 className="text-xl font-bold text-white font-ui">Agent Portal</h1>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-11 px-4 rounded-xl bg-[#1E1E20] border border-[#FFFFFF14] text-sm text-white font-ui placeholder:text-[#FFFFFF40] outline-none focus:border-[#6B63DF]"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-11 px-4 rounded-xl bg-[#1E1E20] border border-[#FFFFFF14] text-sm text-white font-ui placeholder:text-[#FFFFFF40] outline-none focus:border-[#6B63DF]"
            />
            {loginError && <p className="text-red-400 text-xs font-ui">{loginError}</p>}
            <button
              onClick={handleLogin}
              disabled={logging || !username || !password}
              className="h-11 rounded-xl text-sm font-ui font-normal text-black disabled:opacity-50 hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)" }}
            >
              {logging ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-[#FFFFFF14] bg-[#111113] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Image width={24} height={24} src="/assets/Group 1597884980.svg" alt="Varntix" />
          <span className="text-sm font-ui font-bold text-white">Varntix Agent Support</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-ui text-[#FFFFFF60]">{agentName}</span>
          <button onClick={logout} className="text-xs font-ui text-red-400 hover:text-red-300">Logout</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className={`${activeConv ? "hidden sm:flex" : "flex"} w-full sm:w-80 border-r border-[#FFFFFF14] bg-[#0c0c0c] flex-col overflow-y-auto shrink-0`}>
          <div className="px-4 py-3 border-b border-[#FFFFFF14]">
            <h2 className="text-xs font-ui font-bold text-[#FFFFFF60] uppercase tracking-wider">Conversations</h2>
          </div>
          {conversations.length === 0 && (
            <p className="px-4 py-8 text-sm text-[#FFFFFF40] font-ui text-center">No conversations yet</p>
          )}
          {conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => selectConversation(c)}
              className={`w-full text-left px-4 py-3 border-b border-[#FFFFFF08] hover:bg-[#FFFFFF06] transition-colors ${activeConv?._id === c._id ? "bg-[#FFFFFF0A]" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-ui text-white truncate">
                  {c.userId ? `${(c.userId as any).firstName} ${(c.userId as any).lastName}` : c.visitorName}
                </span>
                <span className={`text-[10px] font-ui px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  c.status === "waiting" ? "bg-yellow-500/20 text-yellow-400" :
                  c.status === "active" ? "bg-green-500/20 text-green-400" :
                  "bg-[#FFFFFF14] text-[#FFFFFF40]"
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-xs font-ui text-[#FFFFFF40] truncate">{c.lastMessage || c.subject}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-ui text-[#FFFFFF30]">
                  {c.lastMessageAt ? timeAgo(c.lastMessageAt) : timeAgo(c.createdAt)}
                </span>
                {c.visitorIp && (
                  <span className="text-[10px] font-ui text-[#FFFFFF20]">
                    {c.visitorIp}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className={`${!activeConv ? "hidden sm:flex" : "flex"} flex-1 flex-col bg-[#111113]`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#FFFFFF40] text-sm font-ui">Select a conversation to start</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="border-b border-[#FFFFFF14] shrink-0">
                <div className="h-14 flex items-center px-4 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setActiveConv(null)}
                      className="sm:hidden text-xs font-ui text-[#6B63DF] shrink-0"
                    >
                      &larr; Back
                    </button>
                    <div className="min-w-0">
                      <h3 className="text-sm font-ui text-white truncate">
                        {activeConv.userId ? `${(activeConv.userId as any).firstName} ${(activeConv.userId as any).lastName}` : activeConv.visitorName}
                      </h3>
                      <p className="text-xs font-ui text-[#FFFFFF40] truncate">
                        {activeConv.userId ? (activeConv.userId as any).email : activeConv.visitorEmail || "Visitor"}
                        <span className="text-[#FFFFFF20] mx-1">|</span>
                        <span className="text-[#FFFFFF30]">{formatDateTime(activeConv.createdAt)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setShowInfo((v) => !v)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-ui ${showInfo ? "bg-[#6B63DF]/20 text-[#6B63DF]" : "bg-[#FFFFFF08] text-[#FFFFFF60] hover:bg-[#FFFFFF14]"}`}
                      title="Visitor info"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                    {activeConv.status === "waiting" && (
                      <button onClick={handleClaim} className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-ui">
                        Claim
                      </button>
                    )}
                    {(activeConv.status === "waiting" || activeConv.status === "active") && (
                      <button onClick={handleClose} className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-ui">
                        Close
                      </button>
                    )}
                  </div>
                </div>

                {/* Visitor info panel */}
                {showInfo && (
                  <div className="px-4 py-2.5 bg-[#0c0c0c] border-t border-[#FFFFFF0A] flex flex-wrap gap-x-6 gap-y-1.5">
                    <div>
                      <span className="text-[10px] font-ui text-[#FFFFFF40] uppercase tracking-wider">IP Address</span>
                      <p className="text-xs font-ui text-white">{activeConv.visitorIp || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-ui text-[#FFFFFF40] uppercase tracking-wider">Source</span>
                      <p className="text-xs font-ui text-white truncate max-w-[200px]">{activeConv.visitorSource || "Direct"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-ui text-[#FFFFFF40] uppercase tracking-wider">Started</span>
                      <p className="text-xs font-ui text-white">{formatDateTime(activeConv.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-ui text-[#FFFFFF40] uppercase tracking-wider">Session ID</span>
                      <p className="text-xs font-ui text-[#FFFFFF60] font-mono truncate max-w-[140px]">{activeConv.visitorSessionId}</p>
                    </div>
                    {activeConv.visitorUserAgent && (
                      <div className="w-full">
                        <span className="text-[10px] font-ui text-[#FFFFFF40] uppercase tracking-wider">Browser</span>
                        <p className="text-[10px] font-ui text-[#FFFFFF50] truncate">{activeConv.visitorUserAgent}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 no-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`max-w-[70%] px-3 py-2 rounded-xl text-sm font-ui leading-relaxed ${
                      msg.senderType === "agent"
                        ? "self-end bg-[#6B63DF] text-white rounded-br-sm"
                        : msg.senderType === "system"
                        ? "self-center bg-[#FFFFFF0A] text-[#FFFFFF60] text-xs text-center"
                        : "self-start bg-[#1E1E20] text-white rounded-bl-sm"
                    }`}
                  >
                    {msg.body}
                    <span className="text-[10px] opacity-50 block mt-0.5 text-right">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              {showQuickReplies && activeConv.status !== "closed" && (
                <div className="px-4 py-2 border-t border-[#FFFFFF0A] bg-[#0a0a0a] flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                  {QUICK_REPLIES.map((qr, i) => (
                    <button
                      key={i}
                      onClick={() => useQuickReply(qr.text)}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#FFFFFF08] text-[#FFFFFF80] hover:bg-[#6B63DF]/20 hover:text-[#6B63DF] transition-colors font-ui whitespace-nowrap"
                      title={qr.text}
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              {activeConv.status !== "closed" && (
                <div className="px-4 py-3 border-t border-[#FFFFFF14] bg-[#0c0c0c]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowQuickReplies((v) => !v)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${showQuickReplies ? "bg-[#6B63DF]/20 text-[#6B63DF]" : "bg-[#1E1E20] text-[#FFFFFF60] hover:text-white"}`}
                      title="Quick replies"
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a reply..."
                      className="flex-1 h-10 px-4 rounded-full bg-[#1E1E20] border border-[#FFFFFF14] text-sm text-white font-ui placeholder:text-[#FFFFFF40] outline-none focus:border-[#6B63DF]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 hover:scale-105 transition-all"
                      style={{ background: "linear-gradient(135deg, #6B63DF 0%, #8EDD23 100%)" }}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
