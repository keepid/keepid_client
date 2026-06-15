import '../Communications/communications.css';

import React, { useEffect, useMemo, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';
import {
  getMessageBoard,
  MessageBoardItem,
} from '../Communications/communicationsApi';

type Props = {
  username: string;
  workerNotes?: string;
  onSaved?: () => void;
};

type TimelineEntry = {
  id: string;
  occurredAt: string;
  title: string;
  body: string;
  source: string;
};

type SaveState = 'idle' | 'saving' | 'saved';

function dateKey(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function sourceLabel(item: MessageBoardItem) {
  switch (item.type) {
    case 'voicemail':
      return 'Voicemail';
    case 'call':
      return 'Call';
    case 'message':
      return item.metadata === 'outbound' ? 'Outbound SMS' : 'Inbound SMS';
    case 'scheduled':
      return 'Scheduled SMS';
    case 'note':
      return 'Communication note';
    default:
      return 'Communication';
  }
}

function titleLabel(item: MessageBoardItem) {
  if (item.type === 'voicemail') return 'Voicemail transcript';
  if (item.type === 'note') return 'Communication note';
  return item.title;
}

function toTimelineItem(item: MessageBoardItem): TimelineEntry {
  const occurredAt = item.occurredAt || item.noteDate || new Date().toISOString();
  return {
    id: `${item.type}-${item.sourceId}`,
    occurredAt,
    title: titleLabel(item),
    body: item.body || item.status || '',
    source: sourceLabel(item),
  };
}

export default function ClientTimelineSection({ username, workerNotes, onSaved }: Props) {
  const alert = useAlert();
  const [communicationItems, setCommunicationItems] = useState<MessageBoardItem[]>([]);
  const [localWorkerNotes, setLocalWorkerNotes] = useState<TimelineEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    let cancelled = false;
    getMessageBoard(username)
      .then((data) => {
        if (!cancelled && data.status === 'SUCCESS') {
          setCommunicationItems(data.items);
        }
      })
      .catch(() => {
        if (!cancelled) setCommunicationItems([]);
      });
    return () => { cancelled = true; };
  }, [username]);

  useEffect(() => {
    setLocalWorkerNotes([]);
  }, [workerNotes, username]);

  const timeline = useMemo(() => {
    const entries = communicationItems
      .filter((item) => item.type !== 'scheduled')
      .map(toTimelineItem);

    if (workerNotes?.trim()) {
      entries.push({
        id: 'legacy-worker-notes',
        occurredAt: new Date().toISOString(),
        title: 'Migrated worker notes',
        body: workerNotes.trim(),
        source: 'Profile',
      });
    }

    entries.push(...localWorkerNotes);

    return entries.sort((a, b) => (
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    ));
  }, [communicationItems, localWorkerNotes, workerNotes]);

  const groupedTimeline = useMemo(() => {
    const groups = new Map<string, TimelineEntry[]>();
    timeline.forEach((entry) => {
      const key = dateKey(entry.occurredAt);
      groups.set(key, [...(groups.get(key) || []), entry]);
    });
    return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
  }, [timeline]);

  async function handleAddWorkerNote() {
    const body = draft.trim();
    if (!body) return;

    const occurredAt = new Date().toISOString();
    const noteBlock = `[${dateKey(occurredAt)} ${timeLabel(occurredAt)}]\n${body}`;
    const nextWorkerNotes = [workerNotes?.trim(), noteBlock].filter(Boolean).join('\n\n');

    setSaveState('saving');
    try {
      const res = await fetch(`${getServerURL()}/save-worker-notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, workerNotes: nextWorkerNotes }),
      });
      const data = await res.json();
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status || 'Failed to save worker note');
      }
      setLocalWorkerNotes((current) => [{
        id: `worker-note-${Date.now()}`,
        occurredAt,
        title: 'Worker note',
        body,
        source: 'Profile',
      }, ...current]);
      setDraft('');
      setSaveState('saved');
      onSaved?.();
    } catch (error: any) {
      setSaveState('idle');
      alert.show(`Failed to save worker note: ${error?.message || String(error)}`, { type: 'error' });
    }
  }

  return (
    <section className="profile-notes-card client-profile-timeline">
      <div className="message-board-header">
        <div>
          <p className="communications-kicker">Client timeline</p>
          <h2>Notes & Communication History</h2>
          <p>Worker notes, call notes, messages, and voicemail transcripts are grouped by date.</p>
        </div>
      </div>

      {groupedTimeline.length > 0 ? (
        <div className="client-timeline">
          {groupedTimeline.map((group, index) => (
            <details key={group.date} className="timeline-day" open={index < 2}>
              <summary>
                <span>{group.date}</span>
                <small>{group.items.length} entries</small>
              </summary>
              <div className="timeline-items">
                {group.items.map((item) => (
                  <article key={item.id} className="timeline-entry">
                    <span className="timeline-dot" />
                    <div>
                      <div className="timeline-entry-top">
                        <strong>{item.title}</strong>
                        <span>{timeLabel(item.occurredAt)}</span>
                      </div>
                      <p>{item.body}</p>
                      <small>{item.source}</small>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="communications-muted">No timeline activity yet.</p>
      )}

      <div className="timeline-composer">
        <label htmlFor="worker-note-draft">Add worker note</label>
        <textarea
          id="worker-note-draft"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (saveState === 'saved') setSaveState('idle');
          }}
          placeholder="Write a new worker note..."
          rows={3}
        />
        <div className="timeline-composer-actions">
          {saveState === 'saved' && <span>Saved</span>}
          <button type="button" disabled={!draft.trim() || saveState === 'saving'} onClick={handleAddWorkerNote}>
            {saveState === 'saving' ? 'Saving...' : 'Add note'}
          </button>
        </div>
      </div>
    </section>
  );
}
