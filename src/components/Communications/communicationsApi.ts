import getServerURL from '../../serverOverride';

export type CallLog = {
  id: string;
  direction: 'inbound' | 'outbound';
  fromPhone?: string;
  toPhone?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  status: 'unmatched' | 'attached' | 'ignored' | 'resolved';
  attachedClientId?: string;
  attachedClientName?: string;
  noteCount: number;
  latestNote?: string;
  voicemailTranscript?: string;
};

export type CallsReport = {
  totalCalls: number;
  attachedCalls: number;
  unmatchedCalls: number;
  callsWithNotes: number;
  totalDurationSeconds: number;
  voicemailTranscripts: number;
};

export type ClientNote = {
  id: string;
  noteDate: string;
  body: string;
  callLogId?: string;
  createdBy?: string;
  createdAt: string;
};

export type Conversation = {
  clientId?: string;
  username?: string;
  displayName: string;
  phone?: string;
  lastActivityAt?: string;
  lastActivityType?: 'call' | 'voicemail' | 'note' | 'message' | 'scheduled' | string;
  lastPreview?: string;
  messageCount: number;
  callCount: number;
  noteCount: number;
  scheduledCount: number;
};

export type MessageBoardItem = {
  type: 'call' | 'voicemail' | 'note' | 'message' | 'scheduled' | 'system';
  occurredAt?: string;
  noteDate?: string;
  sourceId: string;
  title: string;
  body?: string;
  status?: string;
  metadata?: string;
};

export type CallsResponse = {
  status: string;
  message?: string;
  calls: CallLog[];
  report: CallsReport;
};

export type MessageBoardResponse = {
  status: string;
  message?: string;
  items: MessageBoardItem[];
  calls: CallLog[];
  notes: ClientNote[];
};

export type ConversationsResponse = {
  status: string;
  message?: string;
  conversations: Conversation[];
};

export type TwilioVoiceTokenResponse = {
  status: string;
  message?: string;
  token?: string;
  identity?: string;
  expiresInSeconds: number;
};

async function jsonFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getServerURL()}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function getCalls(status = 'all', search = '') {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  return jsonFetch<CallsResponse>(`/api/communications/calls?${params.toString()}`);
}

export function getConversations(search = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  return jsonFetch<ConversationsResponse>(`/api/communications/conversations?${params.toString()}`);
}

export function attachCall(callId: string, clientId: string) {
  return jsonFetch<CallsResponse>(`/api/communications/calls/${callId}/attach`, {
    method: 'POST',
    body: JSON.stringify({ clientId }),
  });
}

export function attachCallToUsername(callId: string, username: string) {
  return jsonFetch<CallsResponse>(`/api/communications/calls/${callId}/attach/${encodeURIComponent(username)}`, {
    method: 'POST',
  });
}

export function updateCallStatus(callId: string, status: string) {
  return jsonFetch<CallsResponse>(`/api/communications/calls/${callId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getMessageBoard(username: string) {
  return jsonFetch<MessageBoardResponse>(`/api/client-profiles/${encodeURIComponent(username)}/message-board`);
}

export function getMessageBoardByPhone(phone: string) {
  const params = new URLSearchParams({ phone });
  return jsonFetch<MessageBoardResponse>(`/api/communications/message-board?${params.toString()}`);
}

export function addClientNote(username: string, body: string, callLogId?: string) {
  return jsonFetch<MessageBoardResponse>(`/api/client-profiles/${encodeURIComponent(username)}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body, callLogId }),
  });
}

export function sendMessage(username: string, body: string, toPhone?: string) {
  return jsonFetch<MessageBoardResponse>(`/api/client-profiles/${encodeURIComponent(username)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body, toPhone }),
  });
}

export function scheduleMessage(username: string, body: string, sendAt: string, toPhone?: string) {
  return jsonFetch<MessageBoardResponse>(`/api/client-profiles/${encodeURIComponent(username)}/scheduled-messages`, {
    method: 'POST',
    body: JSON.stringify({ body, sendAt, toPhone }),
  });
}

export function getTwilioVoiceToken() {
  return jsonFetch<TwilioVoiceTokenResponse>('/api/communications/voice/token');
}

export function formatDuration(seconds?: number) {
  if (seconds == null) return 'Pending';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}
