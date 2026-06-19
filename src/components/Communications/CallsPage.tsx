import './communications.css';

import AddIcon from '@mui/icons-material/Add';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  Conversation,
  getConversations,
  getMessageBoard,
  getMessageBoardByPhone,
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
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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

function itemTitle(item: MessageBoardItem, conversation: Conversation) {
  if (item.type === 'message' && item.metadata !== 'outbound') return conversation.displayName;
  if (item.type === 'voicemail') {
    return item.metadata === 'outbound' ? 'Keep.id voicemail transcript' : `${conversation.displayName} voicemail transcript`;
  }
  return item.title;
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
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [conversationError, setConversationError] = useState('');
  const [threadError, setThreadError] = useState('');

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
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status);
      }
      setConversations(data.conversations);
      setSelectedUsername((current) => {
        if (current && data.conversations.some((conversation) => conversationKey(conversation) === current)) {
          return current;
        }
        return conversationKey(data.conversations[0]);
      });
      setConversationError('');
    } catch (error) {
      setConversations([]);
      setSelectedUsername('');
      setConversationError(error instanceof Error ? error.message : 'Could not load conversations.');
    }
  }

  async function loadThread(conversation: Conversation) {
    setIsLoadingThread(true);
    try {
      const data = conversation.username
        ? await getMessageBoard(conversation.username)
        : await getMessageBoardByPhone(conversation.phone || '');
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status);
      }
      setItems(data.items);
      setThreadError('');
    } catch (error) {
      setItems([]);
      setThreadError(error instanceof Error ? error.message : 'Could not load this conversation.');
    } finally {
      setIsLoadingThread(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selected?.username || selected?.phone) {
      loadThread(selected);
    } else if (selected) {
      setItems([]);
      setThreadError('');
    }
  }, [selected?.username, selected?.phone]);

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
    if (schedule) {
      await scheduleMessage(selected.username, scheduledBody, new Date(scheduledSendAt).toISOString(), selected.phone);
      await loadThread(selected);
      await loadConversations();
    } else {
      await sendMessage(selected.username, message, selected.phone);
      await loadThread(selected);
      await loadConversations();
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
            <AddIcon fontSize="small" />
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
          {conversationError && <p className="communications-muted">{conversationError}</p>}
          {!conversationError && filtered.length === 0 && (
            <p className="communications-muted">No clients found.</p>
          )}
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
                <button
                  type="button"
                  className="chat-icon-action"
                  onClick={loadConversations}
                  aria-label="Refresh conversations"
                >
                  <RefreshOutlinedIcon fontSize="small" />
                </button>
              </div>
            </header>

            <div className="chat-scroll">
              {isLoadingThread && <p className="communications-muted">Loading conversation...</p>}
              {threadError && <p className="communications-muted">{threadError}</p>}
              {!isLoadingThread && !threadError && visibleItems.length === 0 && (
                <p className="communications-muted">No messages, calls, or notes yet.</p>
              )}
              {visibleItems.map((item) => {
                const side = itemSide(item);
                const title = itemTitle(item, selected);
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
                <section className="call-modal" aria-label="Phone dialer">
                  <button type="button" className="call-close" onClick={() => setIsCalling(false)} aria-label="Close call modal">
                    ×
                  </button>
                  <div className="call-modal-header">
                    <span className="contact-avatar large">{selected.displayName.charAt(0).toUpperCase()}</span>
                    <div>
                      <p className="communications-kicker">Phone dialer</p>
                      <h2>{selected.displayName}</h2>
                    </div>
                  </div>
                  <label className="call-number-wrap">
                    Phone number
                    <input className="call-number-input" value={phone(selected.phone)} readOnly />
                  </label>
                  <label className="call-notes-wrap">
                    Notes
                    <textarea className="call-notes" placeholder="Add notes during or after the call..." />
                  </label>
                  <p className="call-help">
                    Twilio calling from the Keep.id hotline is not enabled yet.
                  </p>
                  <div className="call-controls">
                    <button type="button" onClick={() => setIsCalling(false)}>Cancel</button>
                    <button
                      type="button"
                      className="call-start disabled"
                      disabled
                      aria-label="Twilio calling is not enabled yet"
                    >
                      <LocalPhoneOutlinedIcon fontSize="small" />
                      Call via Keep.id
                    </button>
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
