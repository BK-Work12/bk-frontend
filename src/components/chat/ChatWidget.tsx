"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  startConversation,
  getConversationMessages,
  sendUserMessage,
  type ChatMsg,
  type Conversation,
} from "@/lib/chatApi";
import { ChatSocketClient, type ChatMessagePayload } from "@/lib/socket";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("varntix_chat_session");
  if (!sid) {
    sid = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("varntix_chat_session", sid);
  }
  return sid;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Don't show on agent-chat or auth pages
  const hidden = pathname?.startsWith("/agent-chat") || pathname?.startsWith("/login") || pathname?.startsWith("/signup");
  
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ChatSocketClient | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Start or resume conversation
  const initConversation = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const visitorSource = typeof window !== "undefined"
        ? document.referrer || window.location.pathname
        : undefined;
      const c = await startConversation({
        visitorSessionId: sessionId,
        visitorName: user ? `${user.firstName} ${user.lastName}`.trim() : "Visitor",
        visitorEmail: user?.email,
        userId: user?.id,
        visitorSource,
      });
      setConv(c);
      setClosed(c.status === "closed");
      if (c.agentId && typeof c.agentId === "object") {
        setAgentName((c.agentId as any).displayName);
      }
      const msgs = await getConversationMessages(c._id);
      setMessages(msgs);
      scrollToBottom();

      // Socket
      if (!socketRef.current) {
        socketRef.current = new ChatSocketClient();
        socketRef.current.connect();
      }
      socketRef.current.subscribeChat(c._id);
    } catch (err) {
      console.error("Chat init error:", err);
    }
  }, [user, scrollToBottom]);

  useEffect(() => {
    if (open && !conv) {
      initConversation();
    }
  }, [open, conv, initConversation]);

  // Socket listeners
  useEffect(() => {
    const sock = socketRef.current;
    if (!sock || !conv) return;

    const unsub1 = sock.onChatMessage((p: ChatMessagePayload) => {
      if (p.conversationId === conv._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === p.id)) return prev;
          return [
            ...prev,
            {
              _id: p.id,
              conversationId: p.conversationId,
              senderType: p.senderType,
              agentId: p.agentId,
              body: p.body,
              read: false,
              createdAt: p.createdAt,
            } as ChatMsg,
          ];
        });
        scrollToBottom();
      }
    });

    const unsub2 = sock.onAgentJoined((p) => {
      if (p.conversationId === conv._id) setAgentName(p.agentName);
    });

    const unsub3 = sock.onChatClosed((p) => {
      if (p.conversationId === conv._id) setClosed(true);
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [conv, scrollToBottom]);

  // Cleanup
  useEffect(() => () => { socketRef.current?.disconnect(); }, []);

  const handleSend = async () => {
    if (!input.trim() || !conv || sending || closed) return;
    const body = input.trim();
    setInput("");
    setSending(true);
    try {
      const msg = await sendUserMessage(conv._id, body, getSessionId());
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const startNewChat = () => {
    localStorage.removeItem("varntix_chat_session");
    setConv(null);
    setMessages([]);
    setClosed(false);
    setAgentName(null);
    initConversation();
  };

  if (hidden) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        style={{ background: "linear-gradient(135deg, #6B63DF 0%, #8EDD23 100%)" }}
        aria-label="Live Chat"
      >
        {open ? (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        ) : (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-[#FFFFFF14] flex flex-col bg-[#111113]">
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#FFFFFF14]" style={{ background: "linear-gradient(135deg, #6B63DF 0%, #4a45a0 100%)" }}>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white">Varntix Support</h3>
              <p className="text-xs text-white/60">
                {closed ? "Chat ended" : agentName ? `${agentName} is here` : "Waiting for agent..."}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm font-ui leading-relaxed ${
                  msg.senderType === "user"
                    ? "self-end bg-[#6B63DF] text-white rounded-br-sm"
                    : msg.senderType === "system"
                    ? "self-center bg-[#FFFFFF0A] text-[#FFFFFF60] text-xs text-center"
                    : "self-start bg-[#1E1E20] text-white rounded-bl-sm"
                }`}
              >
                {msg.senderType === "agent" && (
                  <span className="text-[10px] text-[#8EDD23] block mb-0.5">Agent</span>
                )}
                {msg.body}
                <span className="text-[10px] opacity-50 block mt-0.5 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#FFFFFF14] bg-[#0c0c0c]">
            {closed ? (
              <button
                onClick={startNewChat}
                className="w-full h-10 rounded-full text-sm font-ui font-normal text-black hover:brightness-110 transition-all"
                style={{ background: "linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)" }}
              >
                Start new chat
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 h-10 px-4 rounded-full bg-[#1E1E20] border border-[#FFFFFF14] text-sm text-white font-ui placeholder:text-[#FFFFFF40] outline-none focus:border-[#6B63DF]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6B63DF 0%, #8EDD23 100%)" }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
