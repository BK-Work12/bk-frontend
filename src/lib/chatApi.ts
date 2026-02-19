import { apiFetch } from './api';

/* ─── Types ─── */
export interface ChatAgent {
  _id: string;
  username: string;
  displayName: string;
  isOnline: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  userId?: { _id: string; firstName: string; lastName: string; email: string };
  visitorName?: string;
  visitorEmail?: string;
  visitorSessionId: string;
  visitorIp?: string;
  visitorSource?: string;
  visitorUserAgent?: string;
  agentId?: { _id: string; displayName: string; username: string };
  status: 'waiting' | 'active' | 'closed';
  subject?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  closedBy?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMsg {
  _id: string;
  conversationId: string;
  senderType: 'user' | 'agent' | 'system';
  agentId?: string;
  userId?: string;
  body: string;
  read: boolean;
  createdAt: string;
}

/* ─── Visitor/User API ─── */

export async function startConversation(data: {
  visitorSessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  userId?: string;
  subject?: string;
  visitorSource?: string;
}): Promise<Conversation> {
  const res = await apiFetch<{ success: boolean; data: Conversation }>('/chat/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getConversationMessages(convId: string): Promise<ChatMsg[]> {
  const res = await apiFetch<{ success: boolean; data: ChatMsg[] }>(`/chat/conversations/${convId}/messages`);
  return res.data;
}

export async function sendUserMessage(convId: string, body: string, visitorSessionId?: string): Promise<ChatMsg> {
  const res = await apiFetch<{ success: boolean; data: ChatMsg }>(`/chat/conversations/${convId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body, visitorSessionId }),
  });
  return res.data;
}

/* ─── Agent API ─── */

export async function agentLogin(username: string, password: string): Promise<{ token: string; agent: { id: string; username: string; displayName: string } }> {
  const res = await apiFetch<{ success: boolean; data: { token: string; agent: any } }>('/chat/agent/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return res.data;
}

export async function getAgentMe(agentToken: string): Promise<ChatAgent> {
  const res = await apiFetch<{ success: boolean; data: ChatAgent }>('/chat/agent/me', { token: agentToken });
  return res.data;
}

export async function getAgentConversations(agentToken: string, status?: string): Promise<Conversation[]> {
  const qs = status ? `?status=${status}` : '';
  const res = await apiFetch<{ success: boolean; data: Conversation[] }>(`/chat/agent/conversations${qs}`, { token: agentToken });
  return res.data;
}

export async function claimConversation(agentToken: string, convId: string): Promise<Conversation> {
  const res = await apiFetch<{ success: boolean; data: Conversation }>(`/chat/agent/conversations/${convId}/claim`, {
    method: 'POST',
    token: agentToken,
  });
  return res.data;
}

export async function closeConversation(agentToken: string, convId: string): Promise<Conversation> {
  const res = await apiFetch<{ success: boolean; data: Conversation }>(`/chat/agent/conversations/${convId}/close`, {
    method: 'POST',
    token: agentToken,
  });
  return res.data;
}

export async function getAgentMessages(agentToken: string, convId: string): Promise<ChatMsg[]> {
  const res = await apiFetch<{ success: boolean; data: ChatMsg[] }>(`/chat/agent/conversations/${convId}/messages`, { token: agentToken });
  return res.data;
}

export async function sendAgentMessage(agentToken: string, convId: string, body: string): Promise<ChatMsg> {
  const res = await apiFetch<{ success: boolean; data: ChatMsg }>(`/chat/agent/conversations/${convId}/messages`, {
    method: 'POST',
    token: agentToken,
    body: JSON.stringify({ body }),
  });
  return res.data;
}

/* ─── Admin API ─── */

export async function getAdminChatAgents(token: string): Promise<ChatAgent[]> {
  const res = await apiFetch<{ success: boolean; data: ChatAgent[] }>('/chat/admin/agents', { token });
  return res.data;
}

export async function createChatAgent(token: string, data: { username: string; password: string; displayName: string }): Promise<ChatAgent> {
  const res = await apiFetch<{ success: boolean; data: ChatAgent }>('/chat/admin/agents', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateChatAgent(token: string, id: string, data: { displayName?: string; password?: string; isActive?: boolean }): Promise<ChatAgent> {
  const res = await apiFetch<{ success: boolean; data: ChatAgent }>(`/chat/admin/agents/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteChatAgent(token: string, id: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/chat/admin/agents/${id}`, { method: 'DELETE', token });
}

export async function getAdminConversations(token: string, page?: number, status?: string): Promise<{ conversations: Conversation[]; total: number; page: number; pages: number }> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params}` : '';
  const res = await apiFetch<{ success: boolean; data: { conversations: Conversation[]; total: number; page: number; pages: number } }>(`/chat/admin/conversations${qs}`, { token });
  return res.data;
}

export async function getAdminConversationMessages(token: string, convId: string): Promise<ChatMsg[]> {
  const res = await apiFetch<{ success: boolean; data: ChatMsg[] }>(`/chat/admin/conversations/${convId}/messages`, { token });
  return res.data;
}
