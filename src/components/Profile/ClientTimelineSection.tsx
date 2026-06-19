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
  editable?: boolean;
  workerNoteIndex?: number;
};

type SaveState = 'idle' | 'saving' | 'saved';

type WorkerNoteEntry = {
  id: string;
  occurredAt: string;
  body: string;
  migrated?: boolean;
};

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

function parseWorkerNotes(notes?: string): WorkerNoteEntry[] {
  const value = notes?.trim();
  if (!value) return [];

  return value
    .split(/\n{2,}(?=\[[^\]]+\])/)
    .map((block, index) => {
      const trimmed = block.trim();
      const match = trimmed.match(/^\[([^\]]+)]\s*\n?([\s\S]*)$/);
      if (match) {
        const parsed = new Date(match[1]);
        return {
          id: `worker-note-${index}-${match[1]}`,
          occurredAt: Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(),
          body: match[2].trim(),
          migrated: false,
        };
      }
      return {
        id: `worker-note-${index}-legacy`,
        occurredAt: new Date().toISOString(),
        body: trimmed,
        migrated: true,
      };
    })
    .filter((entry) => entry.body);
}

function serializeWorkerNotes(entries: WorkerNoteEntry[]) {
  return entries
    .filter((entry) => entry.body.trim())
    .map((entry) => `[${dateKey(entry.occurredAt)} ${timeLabel(entry.occurredAt)}]\n${entry.body.trim()}`)
    .join('\n\n');
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
  const [workerNoteEntries, setWorkerNoteEntries] = useState<WorkerNoteEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [editingNoteId, setEditingNoteId] = useState('');
  const [editDraft, setEditDraft] = useState('');
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
    setWorkerNoteEntries(parseWorkerNotes(workerNotes));
    setEditingNoteId('');
    setEditDraft('');
  }, [workerNotes, username]);

  const timeline = useMemo(() => {
    const entries = communicationItems
      .filter((item) => item.type !== 'scheduled')
      .map(toTimelineItem);

    workerNoteEntries.forEach((entry, index) => {
      entries.push({
        id: entry.id,
        occurredAt: entry.occurredAt,
        title: entry.migrated ? 'Migrated worker notes' : 'Worker note',
        body: entry.body,
        source: 'Profile',
        editable: true,
        workerNoteIndex: index,
      });
    });

    return entries.sort((a, b) => (
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    ));
  }, [communicationItems, workerNoteEntries]);

  const groupedTimeline = useMemo(() => {
    const groups = new Map<string, TimelineEntry[]>();
    timeline.forEach((entry) => {
      const key = dateKey(entry.occurredAt);
      groups.set(key, [...(groups.get(key) || []), entry]);
    });
    return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
  }, [timeline]);

  async function saveWorkerNotes(nextEntries: WorkerNoteEntry[]) {
    setSaveState('saving');
    try {
      const res = await fetch(`${getServerURL()}/save-worker-notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, workerNotes: serializeWorkerNotes(nextEntries) }),
      });
      const data = await res.json();
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status || 'Failed to save worker note');
      }
      setWorkerNoteEntries(nextEntries);
      setSaveState('saved');
      onSaved?.();
      return true;
    } catch (error: any) {
      setSaveState('idle');
      alert.show(`Failed to save worker note: ${error?.message || String(error)}`, { type: 'error' });
      return false;
    }
  }

  async function handleAddWorkerNote() {
    const body = draft.trim();
    if (!body) return;

    const nextEntries = [{
      id: `worker-note-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      body,
      migrated: false,
    }, ...workerNoteEntries];

    const saved = await saveWorkerNotes(nextEntries);
    if (saved) {
      setDraft('');
    }
  }

  async function handleSaveEdit(item: TimelineEntry) {
    if (item.workerNoteIndex == null || !editDraft.trim()) return;
    const nextEntries = workerNoteEntries.map((entry, index) => (
      index === item.workerNoteIndex ? { ...entry, body: editDraft.trim() } : entry
    ));
    const saved = await saveWorkerNotes(nextEntries);
    if (saved) {
      setEditingNoteId('');
      setEditDraft('');
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
            <details key={group.date} className="timeline-day" open={index === groupedTimeline.length - 1}>
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
                        <span>
                          {timeLabel(item.occurredAt)}
                          {item.editable && (
                            <button
                              type="button"
                              className="timeline-edit-button"
                              onClick={() => {
                                setEditingNoteId(item.id);
                                setEditDraft(item.body);
                                setSaveState('idle');
                              }}
                              aria-label="Edit worker note"
                            >
                              <PencilIcon />
                            </button>
                          )}
                        </span>
                      </div>
                      {editingNoteId === item.id ? (
                        <div className="timeline-edit-form">
                          <textarea
                            value={editDraft}
                            onChange={(event) => setEditDraft(event.target.value)}
                            rows={3}
                          />
                          <div>
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingNoteId('')}>Cancel</button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={!editDraft.trim() || saveState === 'saving'}
                              onClick={() => handleSaveEdit(item)}
                            >
                              {saveState === 'saving' ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{item.body}</p>
                      )}
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
