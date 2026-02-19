import { io, Socket } from 'socket.io-client';

/** Base URL for Socket.IO (same host as API, no /api). Use NEXT_PUBLIC_SOCKET_URL if API and socket are on different hosts. */
function getSocketBaseUrl(override?: string): string {
  if (override?.trim()) {
    const u = override.replace(/\/+$/, '');
    return u.replace(/\/api\/?$/, '') || u;
  }
  const apiBase =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')) ||
    'http://localhost:5057/api';
  return apiBase.replace(/\/api\/?$/, '') || 'http://localhost:5057';
}

export type PaymentReceivedPayload = {
  paymentId: string;
  status: string;
};

export type PaymentStatusPayload = {
  paymentId: string;
  status: string;
};

/**
 * WebSocket client for payment notifications (NowPayments IPN → backend → this client).
 * Connects to the backend Socket.io server and subscribes to payment status events.
 * Set NEXT_PUBLIC_SOCKET_URL if your Socket.IO server is on a different host than the API (e.g. wss://api.varntix.com).
 */
export class PaymentSocketClient {
  private socket: Socket | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ??
      getSocketBaseUrl(typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SOCKET_URL : undefined);
  }

  /** Connect to the backend. Idempotent: reuses existing connection if already connected. */
  connect(): void {
    if (this.socket?.connected) return;
    if (this.socket) {
      this.socket.connect();
      return;
    }
    this.socket = io(this.baseUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      withCredentials: true,
    });
  }

  /** Subscribe to payment status for a given payment ID. Emits when connected; if already connected, emits immediately. */
  subscribePayment(paymentId: string): void {
    if (!this.socket) return;
    const emit = () => this.socket?.emit('subscribe_payment', paymentId);
    if (this.socket.connected) {
      emit();
    } else {
      this.socket.once('connect', emit);
    }
  }

  /**
   * Register a callback for the payment_received event.
   * @returns Unsubscribe function to remove the listener and optionally disconnect.
   */
  onPaymentReceived(callback: (payload: PaymentReceivedPayload) => void): () => void {
    if (!this.socket) return () => {};
    const handler = (payload: PaymentReceivedPayload) => callback(payload);
    this.socket.on('payment_received', handler);
    return () => {
      this.socket?.off('payment_received', handler);
    };
  }

  /**
   * Register a callback for the payment_status event (every IPN update: waiting, confirming, finished, etc.).
   * @returns Unsubscribe function to remove the listener.
   */
  onPaymentStatus(callback: (payload: PaymentStatusPayload) => void): () => void {
    if (!this.socket) return () => {};
    const handler = (payload: PaymentStatusPayload) => callback(payload);
    this.socket.on('payment_status', handler);
    return () => {
      this.socket?.off('payment_status', handler);
    };
  }

  /** Disconnect and clear the socket instance. */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /** Whether the client is currently connected. */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export type VerificationStatusPayload = { status: 'approved' | 'failed' };

/**
 * WebSocket client for verification status (Sumsub webhook → backend → this client).
 * Connect and subscribe to user room to receive verification_status when Step 3 completes.
 */
export class UserSocketClient {
  private socket: Socket | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ??
      getSocketBaseUrl(typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SOCKET_URL : undefined);
  }

  connect(): void {
    if (this.socket?.connected) return;
    if (this.socket) {
      this.socket.connect();
      return;
    }
    this.socket = io(this.baseUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      withCredentials: true,
    });
  }

  subscribeUser(userId: string): void {
    if (!this.socket) return;
    const emit = () => this.socket?.emit('subscribe_user', userId);
    if (this.socket.connected) {
      emit();
    } else {
      this.socket.once('connect', emit);
    }
  }

  onVerificationStatus(callback: (payload: VerificationStatusPayload) => void): () => void {
    if (!this.socket) return () => {};
    const handler = (payload: VerificationStatusPayload) => callback(payload);
    this.socket.on('verification_status', handler);
    return () => {
      this.socket?.off('verification_status', handler);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

/* ─── Admin Notification Socket ─── */

export type AdminNotificationPayload = {
  id: string;
  type: 'new_user' | 'new_deposit' | 'new_subscription';
  title: string;
  message: string;
  relatedUser?: string;
  relatedId?: string;
  meta?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

/**
 * WebSocket client for admin notifications.
 * Joins the "admin" room and receives admin_notification events in real time.
 */
/* ─── Chat Socket Client ─── */

export type ChatMessagePayload = {
  id: string;
  conversationId: string;
  senderType: 'user' | 'agent' | 'system';
  agentId?: string;
  agentName?: string;
  body: string;
  createdAt: string;
};

export type ChatAgentJoinedPayload = {
  conversationId: string;
  agentName: string;
};

export type ChatClosedPayload = {
  conversationId: string;
  closedBy: string;
};

export type ChatNewConversationPayload = {
  conversationId: string;
  visitorName: string;
  subject: string;
  createdAt: string;
};

/**
 * WebSocket client for live chat.
 * Users subscribe to their conversation room; agents subscribe to the chat_agents room.
 */
export class ChatSocketClient {
  private socket: Socket | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ??
      getSocketBaseUrl(typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SOCKET_URL : undefined);
  }

  connect(): void {
    if (this.socket?.connected) return;
    if (this.socket) { this.socket.connect(); return; }
    this.socket = io(this.baseUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      withCredentials: true,
    });
  }

  subscribeChat(conversationId: string): void {
    if (!this.socket) return;
    const emit = () => this.socket?.emit('subscribe_chat', conversationId);
    if (this.socket.connected) emit();
    else this.socket.once('connect', emit);
  }

  subscribeChatAgents(): void {
    if (!this.socket) return;
    const emit = () => this.socket?.emit('subscribe_chat_agents');
    if (this.socket.connected) emit();
    else this.socket.once('connect', emit);
  }

  onChatMessage(cb: (p: ChatMessagePayload) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('chat_message', cb);
    return () => { this.socket?.off('chat_message', cb); };
  }

  onAgentJoined(cb: (p: ChatAgentJoinedPayload) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('chat_agent_joined', cb);
    return () => { this.socket?.off('chat_agent_joined', cb); };
  }

  onChatClosed(cb: (p: ChatClosedPayload) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('chat_closed', cb);
    return () => { this.socket?.off('chat_closed', cb); };
  }

  onNewConversation(cb: (p: ChatNewConversationPayload) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('chat_new_conversation', cb);
    return () => { this.socket?.off('chat_new_conversation', cb); };
  }

  onConversationUpdated(cb: (p: { conversationId: string; status: string }) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('chat_conversation_updated', cb);
    return () => { this.socket?.off('chat_conversation_updated', cb); };
  }

  disconnect(): void {
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
  }

  get isConnected(): boolean { return this.socket?.connected ?? false; }
}

export class AdminSocketClient {
  private socket: Socket | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ??
      getSocketBaseUrl(typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SOCKET_URL : undefined);
  }

  connect(): void {
    if (this.socket?.connected) return;
    if (this.socket) {
      this.socket.connect();
      return;
    }
    this.socket = io(this.baseUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      withCredentials: true,
    });
  }

  /** Join the admin notification room */
  subscribeAdmin(): void {
    if (!this.socket) return;
    const emit = () => this.socket?.emit('subscribe_admin');
    if (this.socket.connected) {
      emit();
    } else {
      this.socket.once('connect', emit);
    }
  }

  /** Listen for incoming admin notifications */
  onAdminNotification(callback: (payload: AdminNotificationPayload) => void): () => void {
    if (!this.socket) return () => {};
    const handler = (payload: AdminNotificationPayload) => callback(payload);
    this.socket.on('admin_notification', handler);
    return () => {
      this.socket?.off('admin_notification', handler);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
