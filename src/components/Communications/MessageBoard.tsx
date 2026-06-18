import './communications.css';

import React, { useEffect, useMemo, useState } from 'react';

import {
  addClientNote,
  getMessageBoard,
  MessageBoardItem,
  scheduleMessage,
  sendMessage,
} from './communicationsApi';

type Props = {
  username: string;
  clientName: string;
  phone?: string;
};

function formatDate(value?: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function MessageBoard({ username, clientName, phone }: Props) {
  const [items, setItems] = useState<MessageBoardItem[]>([]);
  const [body, setBody] = useState('');
  const [note, setNote] = useState('');
  const [sendAt, setSendAt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState('');

  async function load() {
    try {
      const data = await getMessageBoard(username);
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status);
      }
      setItems(data.items);
      setLoadError('');
    } catch (error) {
      setItems([]);
      setLoadError(error instanceof Error ? error.message : 'Could not load message board.');
    }
  }

  useEffect(() => {
    if (username) load();
  }, [username]);

  const grouped = useMemo(() => items.reduce<Record<string, MessageBoardItem[]>>((acc, item) => {
    const key = new Date(item.occurredAt || item.noteDate || Date.now()).toLocaleDateString();
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {}), [items]);

  async function handleSend(schedule: boolean) {
    if (!body.trim()) return;
    setIsSending(true);
    try {
      if (schedule) {
        await scheduleMessage(username, body, new Date(sendAt).toISOString(), phone);
        await load();
      } else {
        await sendMessage(username, body, phone);
        await load();
      }
      setBody('');
      setSendAt('');
    } finally {
      setIsSending(false);
    }
  }

  async function handleNote() {
    if (!note.trim()) return;
    await addClientNote(username, note);
    await load();
    setNote('');
  }

  return (
    <section className="message-board card mt-3 mb-3">
      <div className="card-body">
        <div className="message-board-header">
          <div>
            <p className="communications-kicker">Client communication</p>
            <h5 className="card-title tw-mb-0">Message Board</h5>
            <p>{clientName || username} {phone ? `• ${phone}` : ''}</p>
          </div>
        </div>

        <div className="message-actions">
          <a className="btn btn-primary" href={phone ? `tel:${phone}` : undefined}>Call</a>
        </div>

        <div className="message-composer">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a freeform message..."
            rows={3}
          />
          <div className="composer-row">
            <input
              type="datetime-local"
              value={sendAt}
              onChange={(e) => setSendAt(e.target.value)}
              aria-label="Schedule send time"
            />
            <button type="button" disabled={isSending || !body.trim()} onClick={() => handleSend(false)}>
              Send now
            </button>
            <button type="button" disabled={isSending || !body.trim() || !sendAt} onClick={() => handleSend(true)}>
              Schedule
            </button>
          </div>
        </div>

        <div className="note-composer">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a dated note..."
          />
          <button type="button" className="btn btn-outline-secondary" onClick={handleNote}>
            Add note
          </button>
        </div>

        <div className="timeline">
          {loadError && <p className="communications-muted">{loadError}</p>}
          {!loadError && items.length === 0 && (
            <p className="communications-muted">No messages, calls, or notes yet.</p>
          )}
          {Object.entries(grouped).map(([date, dateItems]) => (
            <div key={date} className="timeline-day">
              <h6>{date}</h6>
              {dateItems.map((item) => (
                <article key={`${item.type}-${item.sourceId}`} className={`timeline-item ${item.type}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{formatDate(item.occurredAt)} {item.status ? `• ${item.status}` : ''}</span>
                  </div>
                  {item.body && <p>{item.body}</p>}
                  {item.metadata && <small>{item.metadata}</small>}
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
