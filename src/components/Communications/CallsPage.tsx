import './communications.css';

import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  Conversation,
  getConversations,
  getMessageBoard,
  MessageBoardItem,
  scheduleMessage,
  sendMessage,
} from './communicationsApi';

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
      <path
        d="M13.7 3.3a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2l-8.8 8.8-3.2.9.9-3.2 8.1-9.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

const now = Date.now();

const demoConversations: Conversation[] = [
  {
    clientId: 'demo-maria',
    username: 'maria-rivera',
    displayName: 'Maria Rivera',
    phone: '+12155550142',
    lastActivityAt: new Date(now - 1000 * 60 * 8).toISOString(),
    lastActivityType: 'message',
    lastPreview: 'I found my birth certificate and can bring it tomorrow morning.',
    messageCount: 3,
    callCount: 2,
    noteCount: 2,
    scheduledCount: 1,
  },
  {
    clientId: 'demo-james',
    username: 'james-carter',
    displayName: 'James Carter',
    phone: '+12155550988',
    lastActivityAt: new Date(now - 1000 * 60 * 52).toISOString(),
    lastActivityType: 'voicemail',
    lastPreview: 'Voicemail transcribed: I am outside and can come back after lunch.',
    messageCount: 1,
    callCount: 3,
    noteCount: 1,
    scheduledCount: 0,
  },
  {
    clientId: 'demo-ana',
    username: 'ana-lopez',
    displayName: 'Ana Lopez',
    phone: '+12155550019',
    lastActivityAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
    lastActivityType: 'scheduled',
    lastPreview: 'Reminder scheduled for tomorrow morning.',
    messageCount: 2,
    callCount: 1,
    noteCount: 0,
    scheduledCount: 1,
  },
];

const demoItems: MessageBoardItem[] = [
  {
    type: 'message',
    sourceId: 'demo-inbound',
    occurredAt: new Date(now - 1000 * 60 * 8).toISOString(),
    title: 'Client message',
    body: 'I found my birth certificate and can bring it tomorrow morning.',
    status: 'received',
    metadata: 'inbound',
  },
  {
    type: 'message',
    sourceId: 'demo-outbound',
    occurredAt: new Date(now - 1000 * 60 * 24).toISOString(),
    title: 'Aisha Patel',
    body: 'Great. Please bring the birth certificate and proof of address.',
    status: 'delivered',
    metadata: 'outbound',
  },
  {
    type: 'voicemail',
    sourceId: 'demo-voicemail',
    occurredAt: new Date(now - 1000 * 60 * 46).toISOString(),
    title: 'Voicemail transcript',
    body: 'Hi, this is Maria. I found my birth certificate and can bring it tomorrow.',
    status: 'transcribed',
    metadata: 'inbound',
  },
  {
    type: 'call',
    sourceId: 'demo-call',
    occurredAt: new Date(now - 1000 * 60 * 60).toISOString(),
    title: 'Inbound call, 6m 12s',
    body: 'Asked what documents to bring before coming in.',
    status: 'attached',
    metadata: '+12155550142',
  },
  {
    type: 'note',
    sourceId: 'demo-note',
    occurredAt: new Date(now - 1000 * 60 * 64).toISOString(),
    title: 'Call note',
    body: 'Client sounded ready to come in tomorrow; asked to keep appointment flexible.',
    status: '',
  },
  {
    type: 'scheduled',
    sourceId: 'demo-scheduled',
    occurredAt: new Date(now + 1000 * 60 * 60 * 18).toISOString(),
    title: 'Scheduled SMS',
    body: 'Reminder: please bring proof of address tomorrow.',
    status: 'pending',
    metadata: '+12155550142',
  },
];

function formatTime(value?: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function phone(value?: string) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value;
}

function itemSide(item: MessageBoardItem) {
  if (item.type === 'message' || item.type === 'voicemail') return item.metadata === 'outbound' ? 'right' : 'left';
  return 'center';
}

function orderedItems(itemsToOrder: MessageBoardItem[]) {
  const timestamp = (item: MessageBoardItem) => new Date(item.occurredAt || item.noteDate || 0).getTime();
  return [...itemsToOrder].sort((a, b) => {
    if (a.type === 'scheduled' && b.type !== 'scheduled') return 1;
    if (a.type !== 'scheduled' && b.type === 'scheduled') return -1;
    return timestamp(a) - timestamp(b);
  });
}

function conversationKey(conversation?: Conversation) {
  if (!conversation) return '';
  return conversation.username || conversation.clientId || conversation.phone || conversation.displayName;
}

function openSelectedClient(conversation: Conversation, history: ReturnType<typeof useHistory>) {
  if (conversation.username) {
    history.push(`/profile/${encodeURIComponent(conversation.username)}`);
    return;
  }
  const params = new URLSearchParams();
  if (conversation.phone) params.set('phone', conversation.phone);
  history.push(`/enroll-client${params.toString() ? `?${params.toString()}` : ''}`);
}

export default function CallsPage() {
  const history = useHistory();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [items, setItems] = useState<MessageBoardItem[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleBody, setScheduleBody] = useState('');
  const [scheduleSendAt, setScheduleSendAt] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const selected = useMemo(
    () => conversations.find((conversation) => conversationKey(conversation) === selectedUsername) || conversations[0],
    [conversations, selectedUsername],
  );

  const visibleItems = useMemo(() => orderedItems(items).filter((item) => item.type !== 'scheduled'), [items]);
  const scheduledItems = useMemo(() => orderedItems(items).filter((item) => item.type === 'scheduled'), [items]);
  const scheduledItem = scheduledItems[0];

  async function loadConversations() {
    try {
      const data = await getConversations(search);
      if (data.status === 'SUCCESS' && data.conversations.length > 0) {
        setConversations(data.conversations);
        setSelectedUsername((current) => current || conversationKey(data.conversations[0]));
        setUsingDemo(false);
      } else {
        setConversations(demoConversations);
        setSelectedUsername((current) => current || conversationKey(demoConversations[0]));
        setUsingDemo(true);
      }
    } catch {
      setConversations(demoConversations);
      setSelectedUsername((current) => current || conversationKey(demoConversations[0]));
      setUsingDemo(true);
    }
  }

  async function loadThread(username: string) {
    setIsLoadingThread(true);
    try {
      const data = await getMessageBoard(username);
      if (data.status === 'SUCCESS' && data.items.length > 0) {
        setItems(data.items);
        setUsingDemo(false);
      } else {
        setItems(demoItems);
        setUsingDemo(true);
      }
    } catch {
      setItems(demoItems);
      setUsingDemo(true);
    } finally {
      setIsLoadingThread(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selected?.username) {
      loadThread(selected.username);
    } else if (selected) {
      setItems([]);
    }
  }, [selected?.username]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) => (
      conversation.displayName.toLowerCase().includes(q)
      || (conversation.username || '').toLowerCase().includes(q)
      || conversation.phone?.toLowerCase().includes(q)
    ));
  }, [conversations, search]);

  useEffect(() => {
    setIsScheduleModalOpen(false);
    setScheduleBody('');
    setScheduleSendAt('');
  }, [selected?.username]);

  function defaultScheduleTime() {
    const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    tomorrow.setHours(9, 0, 0, 0);
    return localInputValue(tomorrow);
  }

  function localDateTimeValue(value?: string) {
    if (!value) return defaultScheduleTime();
    return localInputValue(new Date(value));
  }

  function localInputValue(date: Date) {
    const offset = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  async function handleSend(schedule: boolean, scheduledBody = message, scheduledSendAt = '') {
    if (!selected?.username || !scheduledBody.trim()) return;
    if (usingDemo) {
      const item: MessageBoardItem = {
        type: schedule ? 'scheduled' : 'message',
        sourceId: schedule ? 'local-scheduled-message' : `local-message-${Date.now()}`,
        occurredAt: schedule && scheduledSendAt ? new Date(scheduledSendAt).toISOString() : new Date().toISOString(),
        title: schedule ? 'Scheduled SMS' : 'Demo Worker',
        body: scheduledBody,
        status: schedule ? 'pending' : 'queued',
        metadata: schedule ? selected.phone : 'outbound',
      };
      setItems((current) => schedule
        ? [item, ...current.filter((existing) => existing.type !== 'scheduled')]
        : [item, ...current]);
    } else if (schedule) {
      await scheduleMessage(selected.username, scheduledBody, new Date(scheduledSendAt).toISOString(), selected.phone);
      await loadThread(selected.username);
    } else {
      await sendMessage(selected.username, message, selected.phone);
      await loadThread(selected.username);
    }
    if (!schedule) setMessage('');
  }

  function handleScheduleClick() {
    if (!selected?.username) return;
    const body = scheduledItem?.body || message;
    if (!body?.trim()) return;
    setScheduleBody(body);
    setScheduleSendAt(localDateTimeValue(scheduledItem?.occurredAt));
    setIsScheduleModalOpen(true);
  }

  async function handleSaveSchedule() {
    if (!selected?.username || !scheduleBody.trim() || !scheduleSendAt) return;
    await handleSend(true, scheduleBody, scheduleSendAt);
    setMessage('');
    setScheduleBody('');
    setScheduleSendAt('');
    setIsScheduleModalOpen(false);
  }

  return (
    <main className="communications-shell">
      <aside className="conversation-list" aria-label="Conversation contacts">
        <div className="conversation-list-header">
          <h1>Clients</h1>
          <button
            type="button"
            className="conversation-add"
            onClick={() => history.push('/enroll-client')}
            aria-label="Enroll client"
          >
            +
          </button>
        </div>
        <input
          className="conversation-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') loadConversations();
          }}
          placeholder="Search clients"
        />
        <div className="contact-scroll">
          {filtered.map((conversation) => (
            <button
              type="button"
              key={conversationKey(conversation)}
              className={`contact-row ${conversationKey(selected) === conversationKey(conversation) ? 'active' : ''}`}
              onClick={() => setSelectedUsername(conversationKey(conversation))}
            >
              <span className="contact-avatar">{conversation.displayName.charAt(0).toUpperCase()}</span>
              <span className="contact-main">
                <strong>{conversation.displayName}</strong>
                <small>{conversation.lastPreview || 'No recent activity'}</small>
              </span>
              <span className="contact-meta">
                <small>{formatTime(conversation.lastActivityAt)}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-panel" aria-label="Selected conversation">
        {selected ? (
          <>
            <header className="chat-header">
              <div>
                <h2>{selected.displayName}</h2>
                <p>{phone(selected.phone)} · {selected.messageCount} messages · {selected.callCount} calls · {selected.noteCount} notes</p>
              </div>
              <div className="chat-actions">
                <button type="button" className="btn btn-outline-secondary" onClick={() => openSelectedClient(selected, history)}>
                  {selected.username ? 'Profile' : 'Enroll'}
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setIsCalling(true)}>Call</button>
                <button type="button" className="btn btn-outline-secondary" onClick={loadConversations}>Refresh</button>
              </div>
            </header>

            <div className="chat-scroll">
              {isLoadingThread && <p className="communications-muted">Loading conversation...</p>}
              {visibleItems.map((item) => {
                const side = itemSide(item);
                const title = item.type === 'voicemail' ? 'Voicemail' : item.title;
                return (
                  <article key={`${item.type}-${item.sourceId}`} className={`chat-item ${side} ${item.type}`}>
                    <div className="chat-bubble">
                      <div className="chat-item-top">
                        <strong>{title}</strong>
                        <span>{formatTime(item.occurredAt)}</span>
                      </div>
                      {item.body && <p>{item.body}</p>}
                      {item.status && <small>{item.status}</small>}
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="chat-composer">
              {scheduledItem && (
                <div className="scheduled-stack">
                  <section className="scheduled-preview existing">
                    <div>
                      <strong>Scheduled SMS</strong>
                      <p>{scheduledItem.body}</p>
                    </div>
                    <div className="scheduled-preview-actions">
                      <span>{formatTime(scheduledItem.occurredAt)}</span>
                      <button type="button" onClick={handleScheduleClick} aria-label="Edit scheduled SMS">
                        <PencilIcon />
                      </button>
                    </div>
                  </section>
                </div>
              )}
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a freeform message"
                rows={2}
              />
              <div className="composer-row composer-actions">
                <button type="button" disabled={!selected.username || !message.trim()} onClick={() => handleSend(false)}>Send</button>
                <button type="button" disabled={!selected.username || (!message.trim() && !scheduledItem)} onClick={handleScheduleClick}>
                  Schedule send
                </button>
              </div>
            </footer>

            {isScheduleModalOpen && (
              <div className="schedule-modal-backdrop" role="presentation">
                <section className="schedule-modal" aria-label="Schedule SMS">
                  <button
                    type="button"
                    className="call-close"
                    onClick={() => setIsScheduleModalOpen(false)}
                    aria-label="Close schedule modal"
                  >
                    ×
                  </button>
                  <div>
                    <p className="communications-kicker">Schedule send</p>
                    <h2>{scheduledItem ? 'Edit scheduled SMS' : 'Schedule SMS'}</h2>
                  </div>
                  <label>
                    Message
                    <textarea
                      value={scheduleBody}
                      onChange={(event) => setScheduleBody(event.target.value)}
                      rows={4}
                    />
                  </label>
                  <label>
                    Send at
                    <input
                      type="datetime-local"
                      value={scheduleSendAt}
                      onChange={(event) => setScheduleSendAt(event.target.value)}
                    />
                  </label>
                  <div className="schedule-modal-actions">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setIsScheduleModalOpen(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" disabled={!scheduleBody.trim() || !scheduleSendAt} onClick={handleSaveSchedule}>
                      Save schedule
                    </button>
                  </div>
                </section>
              </div>
            )}

            {isCalling && (
              <div className="call-modal-backdrop" role="presentation">
                <section className="call-modal" aria-label="Active call">
                  <button type="button" className="call-close" onClick={() => setIsCalling(false)} aria-label="Close call modal">
                    ×
                  </button>
                  <div className="call-modal-header">
                    <span className="contact-avatar large">{selected.displayName.charAt(0).toUpperCase()}</span>
                    <div>
                      <p className="communications-kicker">Calling</p>
                      <h2>{selected.displayName}</h2>
                      <strong>{phone(selected.phone)}</strong>
                    </div>
                    <span className="call-timer">00:42</span>
                  </div>
                  <label className="call-notes-wrap">
                    Call notes
                    <textarea className="call-notes" placeholder="Take call notes while you talk..." defaultValue="Client is asking whether a shelter letter can count as proof of address." />
                  </label>
                  <label className="call-volume">
                    Volume
                    <input type="range" min="0" max="100" defaultValue="72" aria-label="Call volume" />
                  </label>
                  <div className="call-controls">
                    <button type="button">Mute</button>
                    <button type="button" className="end-call" onClick={() => setIsCalling(false)}>End</button>
                  </div>
                </section>
              </div>
            )}
          </>
        ) : (
          <div className="empty-chat">
            <h2>Select a contact</h2>
            <p>Recent messages, calls, voicemail transcripts, scheduled messages, and notes will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
