import React, { useCallback, useEffect, useRef, useState } from 'react';

import getServerURL from '../../serverOverride';

type Props = {
  workerNotes?: string;
  targetUsername: string;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'initial';

const DEBOUNCE_MS = 1000;

export default function WorkerNotesSection({ workerNotes, targetUsername }: Props) {
  const [notes, setNotes] = useState(workerNotes ?? '');
  const [saveState, setSaveState] = useState<SaveState>('initial');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setNotes(workerNotes ?? '');
  }, [workerNotes]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
  }, []);

  const save = useCallback(async (text: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSaveState('saving');
    try {
      const res = await fetch(`${getServerURL()}/save-worker-notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername, workerNotes: text }),
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          setSaveState('saved');
        } else {
          setSaveState('idle');
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setSaveState('idle');
      }
    }
  }, [targetUsername]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setNotes(text);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(text), DEBOUNCE_MS);
  }

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body">
        <div className="tw-flex tw-items-center tw-justify-between">
          <h5 className="card-title tw-mb-0">Worker Notes</h5>
          <SaveIndicator state={saveState} />
        </div>
        <hr />
        <textarea
          className="form-control"
          rows={6}
          value={notes}
          onChange={handleChange}
          placeholder="Add notes about this client..."
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'initial' || state === 'idle') return null;

  if (state === 'saving') {
    return (
      <div className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-text-gray-400">
        <svg
          className="tw-animate-spin tw-h-3 tw-w-3"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
            strokeDashoffset="10"
          />
        </svg>
        Saving...
      </div>
    );
  }

  return (
    <span className="tw-text-xs tw-text-gray-400">Saved</span>
  );
}
