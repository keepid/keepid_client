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
  voicemailRecordingUrl?: string;
  callTranscript?: string;
  callRecordingUrl?: string;
  transcriptionSid?: string;
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

export type CommunicationContactType = 'PERSON' | 'COLD' | 'SHARED';

export type CommunicationContactPhone = {
  id: string;
  phoneNumber: string;
  position: 'primary' | 'secondary';
  label?: string;
  relationship: 'routing_owner' | 'shared_reference';
  routingContactId?: string;
  routingContactLabel?: string;
};

export type CommunicationContact = {
  id: string;
  userId?: string;
  username?: string;
  displayName: string;
  label?: string;
  type: CommunicationContactType;
  shared: boolean;
  mergedIntoContactId?: string;
  primaryPhone?: string;
  lastActivityAt?: string;
  lastActivityType?: 'call' | 'voicemail' | 'note' | 'message' | 'scheduled' | string;
  lastPreview?: string;
  messageCount: number;
  callCount: number;
  noteCount: number;
  scheduledCount: number;
  phones: CommunicationContactPhone[];
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
  recordingUrl?: string;
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

export type CommunicationContactListResponse = {
  status: string;
  message?: string;
  contacts: CommunicationContact[];
};

export type CommunicationContactResponse = {
  status: string;
  message?: string;
  contact?: CommunicationContact;
};

export type CommunicationContactReferencesResponse = {
  status: string;
  message?: string;
  contacts: CommunicationContact[];
};

export type PromoteSharedResponse = {
  status: string;
  message?: string;
  sharedContact?: CommunicationContact;
  moved: {
    messages: number;
    calls: number;
    callNotes: number;
    scheduledMessages: number;
  };
};

export type TwilioVoiceTokenResponse = {
  status: string;
  message?: string;
  token?: string;
  identity?: string;
  expiresInSeconds: number;
};

export class CommunicationApiError extends Error {
  statusCode: number;

  status?: string;

  payload?: unknown;

  constructor(message: string, statusCode: number, status?: string, payload?: unknown) {
    super(message);
    this.name = 'CommunicationApiError';
    this.statusCode = statusCode;
    this.status = status;
    this.payload = payload;
  }
}

async function jsonFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getServerURL()}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let payload: any = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (_error) {
      payload = { message: text };
    }
  }
  if (!res.ok) {
    throw new CommunicationApiError(
      payload.message || payload.status || `Request failed: ${res.status}`,
      res.status,
      payload.status,
      payload,
    );
  }
  return payload as T;
}

export function getCommunicationContacts(search = '', type = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (type) params.set('type', type);
  const query = params.toString();
  return jsonFetch<CommunicationContactListResponse>(`/api/communication-contacts${query ? `?${query}` : ''}`);
}

export function getCommunicationContact(contactId: string) {
  return jsonFetch<CommunicationContactResponse>(`/api/communication-contacts/${encodeURIComponent(contactId)}`);
}

export function createCommunicationContact(label: string, phoneNumber?: string) {
  return jsonFetch<CommunicationContactResponse>('/api/communication-contacts', {
    method: 'POST',
    body: JSON.stringify({ label, phoneNumber }),
  });
}

export function updateCommunicationContact(contactId: string, update: { label?: string; archived?: boolean }) {
  return jsonFetch<CommunicationContactResponse>(`/api/communication-contacts/${encodeURIComponent(contactId)}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
}

export function mergeCommunicationContact(sourceContactId: string, destinationContactId: string) {
  return jsonFetch<CommunicationContactResponse>(
    `/api/communication-contacts/${encodeURIComponent(sourceContactId)}/merge`,
    {
      method: 'POST',
      body: JSON.stringify({ destinationContactId }),
    },
  );
}

export function addCommunicationContactPhone(
  contactId: string,
  phoneNumber: string,
  position: 'primary' | 'secondary',
  label?: string,
  sharedReference = false,
) {
  return jsonFetch<CommunicationContactResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/phones`,
    {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, position, label, sharedReference }),
    },
  );
}

export function updateCommunicationContactPhone(
  contactId: string,
  phoneId: string,
  update: { position?: 'primary' | 'secondary'; label?: string },
) {
  return jsonFetch<CommunicationContactResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/phones/${encodeURIComponent(phoneId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(update),
    },
  );
}

export function deactivateCommunicationContactPhone(contactId: string, phoneId: string) {
  return jsonFetch<CommunicationContactResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/phones/${encodeURIComponent(phoneId)}`,
    { method: 'DELETE' },
  );
}

export function promoteCommunicationContactPhone(contactId: string, phoneId: string, label: string) {
  return jsonFetch<PromoteSharedResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/phones/${encodeURIComponent(phoneId)}/promote-shared`,
    {
      method: 'POST',
      body: JSON.stringify({ label }),
    },
  );
}

export function getCommunicationContactReferences(contactId: string) {
  return jsonFetch<CommunicationContactReferencesResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/references`,
  );
}

export function getCommunicationContactTimeline(contactId: string) {
  return jsonFetch<MessageBoardResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/timeline`,
  );
}

export function addCommunicationContactNote(
  contactId: string,
  body: string,
  callLogId?: string,
  attachToLatestCall = false,
) {
  return jsonFetch<MessageBoardResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/notes`,
    {
      method: 'POST',
      body: JSON.stringify({ body, callLogId, attachToLatestCall }),
    },
  );
}

export function updateCommunicationContactNote(contactId: string, noteId: string, body: string) {
  return jsonFetch<MessageBoardResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/notes/${encodeURIComponent(noteId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    },
  );
}

export function sendCommunicationContactMessage(contactId: string, body: string, toPhone?: string) {
  return jsonFetch<MessageBoardResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ body, toPhone }),
    },
  );
}

export function scheduleCommunicationContactMessage(
  contactId: string,
  body: string,
  sendAt: string,
  toPhone?: string,
) {
  return jsonFetch<MessageBoardResponse>(
    `/api/communication-contacts/${encodeURIComponent(contactId)}/scheduled-messages`,
    {
      method: 'POST',
      body: JSON.stringify({ body, sendAt, toPhone }),
    },
  );
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

export function addClientNote(username: string, body: string, callLogId?: string, attachToLatestCall = false) {
  return jsonFetch<MessageBoardResponse>(`/api/client-profiles/${encodeURIComponent(username)}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body, callLogId, attachToLatestCall }),
  });
}

export function updateClientNote(username: string, noteId: string, body: string) {
  return jsonFetch<MessageBoardResponse>(
    `/api/client-profiles/${encodeURIComponent(username)}/notes/${encodeURIComponent(noteId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    },
  );
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

export function getCallRecordingPlaybackUrl(callId: string) {
  return `${getServerURL()}/api/communications/calls/${encodeURIComponent(callId)}/recording`;
}

export function formatDuration(seconds?: number) {
  if (seconds == null) return 'Pending';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}
