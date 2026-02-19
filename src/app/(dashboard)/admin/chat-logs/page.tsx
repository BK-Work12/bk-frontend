"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getToken } from "@/lib/auth";
import {
  getAdminConversations,
  getAdminConversationMessages,
  type Conversation,
  type ChatMsg,
} from "@/lib/chatApi";

export default function ChatLogsPage() {
  const token = getToken();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAdminConversations(token, page, statusFilter || undefined);
      setConversations(data.conversations);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  }, [token, page, statusFilter]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const viewMessages = async (conv: Conversation) => {
    setSelectedConv(conv);
    if (!token) return;
    setLoadingMsgs(true);
    try {
      const msgs = await getAdminConversationMessages(token, conv._id);
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {}
    setLoadingMsgs(false);
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt.getFullYear()} ${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatTime = (d: string) => {
    return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
      <AdminLayout>
        <div className="max-w-6xl">
          <h1 className="text-base font-normal font-ui text-white mb-6">Chat Logs</h1>

          {selectedConv ? (
            <div>
              <button onClick={() => { setSelectedConv(null); setMessages([]); }} className="text-xs font-ui text-[#6B63DF] mb-4 hover:underline">
                &larr; Back to conversations
              </button>
              <div className="bg-[#111113] border border-[#FFFFFF14] rounded-xl overflow-hidden">
                {/* Header with meta info */}
                <div className="px-4 py-3 border-b border-[#FFFFFF14]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-ui text-white">
                      {selectedConv.userId
                        ? `${(selectedConv.userId as any).firstName} ${(selectedConv.userId as any).lastName}`
                        : selectedConv.visitorName}
                    </h3>
                    <span className={`text-[10px] font-ui px-2 py-0.5 rounded-full ${
                      selectedConv.status === "waiting" ? "bg-yellow-500/20 text-yellow-400" :
                      selectedConv.status === "active" ? "bg-green-500/20 text-green-400" :
                      "bg-[#FFFFFF14] text-[#FFFFFF40]"
                    }`}>
                      {selectedConv.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-ui text-[#FFFFFF40]">
                    <span>
                      Email: <span className="text-[#FFFFFF60]">{selectedConv.userId ? (selectedConv.userId as any).email : selectedConv.visitorEmail || "N/A"}</span>
                    </span>
                    <span>
                      Agent: <span className="text-[#FFFFFF60]">{selectedConv.agentId ? (selectedConv.agentId as any).displayName : "Unassigned"}</span>
                    </span>
                    <span>
                      Started: <span className="text-[#FFFFFF60]">{formatDate(selectedConv.createdAt)}</span>
                    </span>
                    {selectedConv.closedAt && (
                      <span>
                        Closed: <span className="text-[#FFFFFF60]">{formatDate(selectedConv.closedAt)}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-ui text-[#FFFFFF40] mt-1.5">
                    <span>
                      IP: <span className="text-[#FFFFFF60] font-mono">{selectedConv.visitorIp || "N/A"}</span>
                    </span>
                    <span>
                      Source: <span className="text-[#FFFFFF60]">{selectedConv.visitorSource || "Direct"}</span>
                    </span>
                    {selectedConv.visitorUserAgent && (
                      <span className="truncate max-w-[400px]">
                        Browser: <span className="text-[#FFFFFF50]">{selectedConv.visitorUserAgent}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="max-h-[500px] overflow-y-auto px-4 py-3 flex flex-col gap-2 no-scrollbar">
                  {loadingMsgs && <p className="text-sm text-[#FFFFFF40] font-ui text-center py-4">Loading...</p>}
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
                      <span className="text-[10px] text-[#FFFFFF60] block mb-0.5">
                        {msg.senderType === "agent" ? "Agent" : msg.senderType === "user" ? "User" : "System"}
                      </span>
                      {msg.body}
                      <span className="text-[10px] opacity-50 block mt-0.5 text-right">{formatTime(msg.createdAt)}</span>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex gap-3 mb-4">
                {["", "waiting", "active", "closed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`h-8 px-3 rounded-lg text-xs font-ui transition-colors ${
                      statusFilter === s
                        ? "bg-[#6B63DF] text-white"
                        : "bg-[#FFFFFF08] text-[#FFFFFF60] hover:bg-[#FFFFFF14]"
                    }`}
                  >
                    {s || "All"} {s === "" ? `(${total})` : ""}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="bg-[#111113] border border-[#FFFFFF14] rounded-xl overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#FFFFFF14]">
                      <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Visitor</th>
                      <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Agent</th>
                      <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Status</th>
                      <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">IP</th>
                      <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Source</th>
                      <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Last Msg</th>
                      <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Date</th>
                      <th className="text-right text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={8} className="text-center py-8 text-sm text-[#FFFFFF40] font-ui">Loading...</td></tr>
                    )}
                    {!loading && conversations.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-8 text-sm text-[#FFFFFF40] font-ui">No conversations</td></tr>
                    )}
                    {conversations.map((c) => (
                      <tr key={c._id} className="border-b border-[#FFFFFF08] hover:bg-[#FFFFFF04]">
                        <td className="px-4 py-3 text-sm font-ui text-white">
                          {c.userId ? `${(c.userId as any).firstName} ${(c.userId as any).lastName}` : c.visitorName}
                        </td>
                        <td className="px-4 py-3 text-sm font-ui text-white">
                          {c.agentId ? (c.agentId as any).displayName : <span className="text-[#FFFFFF40]">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-ui px-2 py-0.5 rounded-full ${
                            c.status === "waiting" ? "bg-yellow-500/20 text-yellow-400" :
                            c.status === "active" ? "bg-green-500/20 text-green-400" :
                            "bg-[#FFFFFF14] text-[#FFFFFF40]"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-ui text-[#FFFFFF60] font-mono">{c.visitorIp || "—"}</td>
                        <td className="px-4 py-3 text-xs font-ui text-[#FFFFFF60] max-w-[120px] truncate">{c.visitorSource || "Direct"}</td>
                        <td className="px-4 py-3 text-xs font-ui text-[#FFFFFF60] max-w-[150px] truncate">{c.lastMessage || "—"}</td>
                        <td className="px-4 py-3 text-xs font-ui text-[#FFFFFF60]">{formatDate(c.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => viewMessages(c)} className="text-xs font-ui text-[#6B63DF] hover:underline">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex gap-2 justify-center mt-4">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-ui ${
                        page === p ? "bg-[#6B63DF] text-white" : "bg-[#FFFFFF08] text-[#FFFFFF60] hover:bg-[#FFFFFF14]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
  );
}
