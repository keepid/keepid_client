import './communications.css';

import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  CallLog,
  CallsReport,
  formatDuration,
  getCalls,
  updateCallStatus,
} from './communicationsApi';

const emptyReport: CallsReport = {
  totalCalls: 0,
  attachedCalls: 0,
  unmatchedCalls: 0,
  callsWithNotes: 0,
  totalDurationSeconds: 0,
  voicemailTranscripts: 0,
};

const demoCalls: CallLog[] = [
  {
    id: 'demo-1',
    direction: 'inbound',
    fromPhone: '+12155550142',
    toPhone: '+12155550000',
    startedAt: new Date().toISOString(),
    durationSeconds: 372,
    status: 'unmatched',
    attachedClientName: '',
    noteCount: 1,
    latestNote: 'Asked what documents to bring before coming in.',
  },
  {
    id: 'demo-2',
    direction: 'inbound',
    fromPhone: '+12155550988',
    toPhone: '+12155550000',
    startedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    durationSeconds: 64,
    status: 'attached',
    attachedClientName: 'Maria R.',
    noteCount: 2,
    latestNote: 'Confirmed appointment and proof of address.',
    voicemailTranscript: 'Hi, this is Maria. I found my birth certificate and can bring it tomorrow.',
  },
  {
    id: 'demo-3',
    direction: 'outbound',
    fromPhone: '+12155550000',
    toPhone: '+18009324600',
    startedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    durationSeconds: 2530,
    status: 'resolved',
    attachedClientName: '',
    noteCount: 1,
    latestNote: 'PennDOT queue call while enrolling client.',
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function phone(value?: string) {
  if (!value) return 'Unknown';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value;
}

export default function CallsPage() {
  const history = useHistory();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [report, setReport] = useState<CallsReport>(emptyReport);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CallLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const data = await getCalls(status, search);
      if (data.status === 'SUCCESS' && data.calls.length > 0) {
        setCalls(data.calls);
        setReport(data.report);
        setUsingDemo(false);
      } else {
        setCalls(demoCalls);
        setReport({
          totalCalls: 3,
          attachedCalls: 1,
          unmatchedCalls: 1,
          callsWithNotes: 3,
          totalDurationSeconds: 2966,
          voicemailTranscripts: 1,
        });
        setUsingDemo(true);
      }
    } catch {
      setCalls(demoCalls);
      setReport({
        totalCalls: 3,
        attachedCalls: 1,
        unmatchedCalls: 1,
        callsWithNotes: 3,
        totalDurationSeconds: 2966,
        voicemailTranscripts: 1,
      });
      setUsingDemo(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return calls;
    return calls.filter((call) => (
      call.fromPhone?.toLowerCase().includes(q)
      || call.toPhone?.toLowerCase().includes(q)
      || call.attachedClientName?.toLowerCase().includes(q)
      || call.latestNote?.toLowerCase().includes(q)
    ));
  }, [calls, search]);

  async function mark(call: CallLog, nextStatus: string) {
    if (usingDemo) {
      setCalls((current) => current.map((c) => (c.id === call.id ? { ...c, status: nextStatus as CallLog['status'] } : c)));
      setSelected((current) => (current && current.id === call.id ? { ...current, status: nextStatus as CallLog['status'] } : current));
      return;
    }
    await updateCallStatus(call.id, nextStatus);
    await load();
  }

  return (
    <main className="communications-page">
      <section className="communications-heading">
        <div>
          <p className="communications-kicker">Organization communications</p>
          <h1>Calls</h1>
          <p>Hotline activity from Twilio, with call length, notes, callback context, and client attachment.</p>
        </div>
        {usingDemo && <span className="communications-pill">Vision demo data</span>}
      </section>

      <section className="report-grid" aria-label="Call reporting summary">
        <Metric label="Total calls" value={report.totalCalls} />
        <Metric label="Unmatched" value={report.unmatchedCalls} />
        <Metric label="Attached" value={report.attachedCalls} />
        <Metric label="With notes" value={report.callsWithNotes} />
        <Metric label="Voicemails" value={report.voicemailTranscripts} />
        <Metric label="Call time" value={formatDuration(report.totalDurationSeconds)} />
      </section>

      <section className="communications-toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search phone, client, or note"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All calls</option>
          <option value="unmatched">Unmatched</option>
          <option value="attached">Attached</option>
          <option value="resolved">Resolved</option>
          <option value="ignored">Ignored</option>
        </select>
        <button type="button" onClick={load}>Refresh</button>
      </section>

      <section className="calls-layout">
        <div className="calls-table-wrap">
          <table className="calls-table">
            <thead>
              <tr>
                <th>Call time</th>
                <th>Number</th>
                <th>Dir</th>
                <th>Length</th>
                <th>Client</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((call) => (
                <tr key={call.id} onClick={() => setSelected(call)}>
                  <td>{formatDate(call.startedAt)}</td>
                  <td>{phone(call.direction === 'inbound' ? call.fromPhone : call.toPhone)}</td>
                  <td>{call.direction === 'inbound' ? 'In' : 'Out'}</td>
                  <td>{formatDuration(call.durationSeconds)}</td>
                  <td>{call.attachedClientName || 'Unmatched'}</td>
                  <td>{call.noteCount}</td>
                  <td><span className={`status-chip ${call.status}`}>{call.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <p className="communications-muted">Loading calls...</p>}
        </div>

        <aside className="call-detail">
          {selected ? (
            <>
              <div className="call-detail-header">
                <div>
                  <p>{selected.direction === 'inbound' ? 'Inbound call' : 'Outbound call'}</p>
                  <h2>{phone(selected.direction === 'inbound' ? selected.fromPhone : selected.toPhone)}</h2>
                </div>
                <span className={`status-chip ${selected.status}`}>{selected.status}</span>
              </div>
              <dl>
                <div><dt>Started</dt><dd>{formatDate(selected.startedAt)}</dd></div>
                <div><dt>Length</dt><dd>{formatDuration(selected.durationSeconds)}</dd></div>
                <div><dt>Client</dt><dd>{selected.attachedClientName || 'Not attached yet'}</dd></div>
              </dl>
              {selected.latestNote && (
                <div className="detail-block">
                  <strong>Latest note</strong>
                  <p>{selected.latestNote}</p>
                </div>
              )}
              {selected.voicemailTranscript && (
                <div className="detail-block transcript">
                  <strong>Voicemail transcript</strong>
                  <p>{selected.voicemailTranscript}</p>
                </div>
              )}
              <div className="detail-actions">
                <a className="btn btn-primary" href={`tel:${selected.direction === 'inbound' ? selected.fromPhone : selected.toPhone}`}>Call back</a>
                {selected.attachedClientName && (
                  <button type="button" className="btn btn-outline-primary" onClick={() => history.push('/profile')}>
                    Open message board
                  </button>
                )}
                <button type="button" className="btn btn-outline-secondary" onClick={() => mark(selected, 'resolved')}>Mark resolved</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => mark(selected, 'ignored')}>Ignore</button>
              </div>
            </>
          ) : (
            <div className="empty-detail">
              <h2>Select a call</h2>
              <p>Review notes, voicemail transcripts, callback actions, and client attachment state.</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
