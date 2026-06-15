import './communications.css';

import React, { useEffect, useMemo, useState } from 'react';

import {
  addClientNote,
  Conversation,
  getConversations,
  getMessageBoard,
  MessageBoardItem,
  scheduleMessage,
  sendMessage,
} from './communicationsApi';

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
    phoneHealthStatus: 'reachable',
    phoneHealthCheckedAt: new Date(now - 1000 * 60 * 30).toISOString(),
    phoneHealthDetail: 'mobile · T-Mobile',
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
    phoneHealthStatus: 'inactive',
    phoneHealthCheckedAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    phoneHealthDetail: 'mobile · unknown carrier',
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
    phoneHealthStatus: 'unknown',
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
    title: 'Worker message',
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

function phoneHealthLabel(status?: string) {
  switch (status) {
    case 'reachable':
      return 'Reachable';
    case 'valid':
      return 'Valid';
    case 'inactive':
      return 'Inactive';
    case 'invalid':
      return 'Invalid';
    default:
      return 'Unknown';
  }
}

function orderedItems(itemsToOrder: MessageBoardItem[]) {
  const timestamp = (item: MessageBoardItem) => new Date(item.occurredAt || item.noteDate || 0).getTime();
  return [...itemsToOrder].sort((a, b) => {
    if (a.type === 'scheduled' && b.type !== 'scheduled') return 1;
    if (a.type !== 'scheduled' && b.type === 'scheduled') return -1;
    return timestamp(a) - timestamp(b);
  });
}

export default function CallsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [items, setItems] = useState<MessageBoardItem[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [noteCallId, setNoteCallId] = useState('');
  const [sendAt, setSendAt] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const selected = useMemo(
    () => conversations.find((conversation) => conversation.username === selectedUsername) || conversations[0],
    [conversations, selectedUsername],
  );

  async function loadConversations() {
    try {
      const data = await getConversations(search);
      if (data.status === 'SUCCESS' && data.conversations.length > 0) {
        setConversations(data.conversations);
        setSelectedUsername((current) => current || data.conversations[0].username);
        setUsingDemo(false);
      } else {
        setConversations(demoConversations);
        setSelectedUsername((current) => current || demoConversations[0].username);
        setUsingDemo(true);
      }
    } catch {
      setConversations(demoConversations);
      setSelectedUsername((current) => current || demoConversations[0].username);
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
    if (selected?.username) loadThread(selected.username);
  }, [selected?.username]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) => (
      conversation.displayName.toLowerCase().includes(q)
      || conversation.username.toLowerCase().includes(q)
      || conversation.phone?.toLowerCase().includes(q)
      || conversation.lastPreview?.toLowerCase().includes(q)
    ));
  }, [conversations, search]);

  async function handleSend(schedule: boolean) {
    if (!selected || !message.trim()) return;
    if (usingDemo) {
      const item: MessageBoardItem = {
        type: schedule ? 'scheduled' : 'message',
        sourceId: `local-message-${Date.now()}`,
        occurredAt: schedule && sendAt ? new Date(sendAt).toISOString() : new Date().toISOString(),
        title: schedule ? 'Scheduled SMS' : 'Worker message',
        body: message,
        status: schedule ? 'pending' : 'queued',
        metadata: schedule ? selected.phone : 'outbound',
      };
      setItems((current) => [item, ...current]);
    } else if (schedule) {
      await scheduleMessage(selected.username, message, new Date(sendAt).toISOString(), selected.phone);
      await loadThread(selected.username);
    } else {
      await sendMessage(selected.username, message, selected.phone);
      await loadThread(selected.username);
    }
    setMessage('');
    setSendAt('');
  }

  async function handleNote() {
    if (!selected || !note.trim()) return;
    if (usingDemo) {
      setItems((current) => [{
        type: 'note',
        sourceId: `local-note-${Date.now()}`,
        occurredAt: new Date().toISOString(),
        title: noteCallId ? 'Call note' : 'Note',
        body: note,
        status: '',
      }, ...current]);
    } else {
      await addClientNote(selected.username, note, noteCallId || undefined);
      await loadThread(selected.username);
    }
    setNote('');
    setNoteCallId('');
  }

  return (
    <main className="communications-shell">
      <aside className="conversation-list" aria-label="Conversation contacts">
        <div className="conversation-list-header">
          <div>
            <p className="communications-kicker">Communications</p>
            <h1>Inbox</h1>
          </div>
          {usingDemo && <span className="communications-pill">Vision data</span>}
        </div>
        <input
          className="conversation-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') loadConversations();
          }}
          placeholder="Search contacts or messages"
        />
        <div className="contact-scroll">
          {filtered.map((conversation) => (
            <button
              type="button"
              key={conversation.username}
              className={`contact-row ${selected?.username === conversation.username ? 'active' : ''}`}
              onClick={() => setSelectedUsername(conversation.username)}
            >
              <span className="contact-avatar">{conversation.displayName.charAt(0).toUpperCase()}</span>
              <span className="contact-main">
                <strong>{conversation.displayName}</strong>
                <small>{conversation.lastPreview || 'No recent activity'}</small>
              </span>
              <span className="contact-meta">
                <small>{formatTime(conversation.lastActivityAt)}</small>
                <span className={`phone-health ${conversation.phoneHealthStatus || 'unknown'}`}>
                  {phoneHealthLabel(conversation.phoneHealthStatus)}
                </span>
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
                <div className="phone-health-row">
                  <span className={`phone-health ${selected.phoneHealthStatus || 'unknown'}`}>
                    {phoneHealthLabel(selected.phoneHealthStatus)}
                  </span>
                  <small>
                    {selected.phoneHealthDetail || 'Phone health not checked yet'}
                    {selected.phoneHealthCheckedAt ? ` · checked ${formatTime(selected.phoneHealthCheckedAt)}` : ''}
                  </small>
                </div>
              </div>
              <div className="chat-actions">
                <a className="btn btn-primary" href={selected.phone ? `tel:${selected.phone}` : undefined}>Call</a>
                <button type="button" className="btn btn-outline-secondary" onClick={loadConversations}>Refresh</button>
              </div>
            </header>

            <div className="chat-scroll">
              {isLoadingThread && <p className="communications-muted">Loading conversation...</p>}
              {orderedItems(items).map((item) => {
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
                      {item.type === 'call' && (
                        <div className="inline-note">
                          <input
                            value={noteCallId === item.sourceId ? note : ''}
                            onFocus={() => setNoteCallId(item.sourceId)}
                            onChange={(event) => {
                              setNoteCallId(item.sourceId);
                              setNote(event.target.value);
                            }}
                            placeholder="Add note to this call"
                          />
                          <button type="button" onClick={handleNote}>Save</button>
                        </div>
                      )}
                      {item.status && <small>{item.status}</small>}
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="chat-composer">
              <div className="note-strip">
                <input
                  value={noteCallId ? '' : note}
                  onFocus={() => setNoteCallId('')}
                  onChange={(event) => {
                    setNoteCallId('');
                    setNote(event.target.value);
                  }}
                  placeholder="Add a dated note to this conversation"
                />
                <button type="button" onClick={handleNote}>Add note</button>
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a freeform message"
                rows={3}
              />
              <div className="composer-row">
                <input
                  type="datetime-local"
                  value={sendAt}
                  onChange={(event) => setSendAt(event.target.value)}
                  aria-label="Schedule send time"
                />
                <button type="button" disabled={!message.trim()} onClick={() => handleSend(false)}>Send</button>
                <button type="button" disabled={!message.trim() || !sendAt} onClick={() => handleSend(true)}>Schedule</button>
              </div>
            </footer>
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
