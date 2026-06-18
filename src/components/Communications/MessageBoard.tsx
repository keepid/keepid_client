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

const demoItems: MessageBoardItem[] = [
  {
    type: 'call',
    sourceId: 'demo-call',
    occurredAt: new Date().toISOString(),
    title: 'Inbound call, 6m 12s',
    body: 'Asked what documents to bring before coming in.',
    status: 'attached',
    metadata: '+12155550142',
  },
  {
    type: 'voicemail',
    sourceId: 'demo-voicemail',
    occurredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    title: 'Voicemail transcript',
    body: 'Hi, I found my birth certificate and can bring it tomorrow morning.',
    status: 'transcribed',
    metadata: '+12155550142',
  },
  {
    type: 'message',
    sourceId: 'demo-message',
    occurredAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    title: 'Worker message',
    body: 'Great. Please bring the birth certificate and proof of address.',
    status: 'delivered',
    metadata: 'outbound',
  },
  {
    type: 'scheduled',
    sourceId: 'demo-scheduled',
    occurredAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    title: 'Scheduled SMS',
    body: 'Reminder: please bring proof of address tomorrow.',
    status: 'pending',
    metadata: '+12155550142',
  },
];

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
  const [usingDemo, setUsingDemo] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function load() {
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
      if (usingDemo) {
        const item: MessageBoardItem = {
          type: schedule ? 'scheduled' : 'message',
          sourceId: `local-${Date.now()}`,
          occurredAt: schedule && sendAt ? new Date(sendAt).toISOString() : new Date().toISOString(),
          title: schedule ? 'Scheduled SMS' : 'Worker message',
          body,
          status: schedule ? 'pending' : 'queued',
          metadata: phone,
        };
        setItems((current) => [item, ...current]);
      } else if (schedule) {
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
    if (usingDemo) {
      setItems((current) => [{
        type: 'note',
        sourceId: `note-${Date.now()}`,
        occurredAt: new Date().toISOString(),
        title: 'Note',
        body: note,
        status: '',
      }, ...current]);
    } else {
      await addClientNote(username, note);
      await load();
    }
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
          {usingDemo && <span className="communications-pill">Vision demo data</span>}
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
