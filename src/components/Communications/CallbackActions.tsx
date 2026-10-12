import './communications.css';

import React, { useState } from 'react';

import { CallbackAction, CallbackSummary, updateCallback } from './communicationsApi';

type Props = {
  callback?: CallbackSummary | null;
  onChanged: () => void | Promise<void>;
};

export default function CallbackActions({ callback, onChanged }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!callback) return null;
  if (callback.status === 'COMPLETED') return <p className="callback-quiet">Called back</p>;
  if (callback.status === 'CANCELLED') return <p className="callback-quiet">Cancelled</p>;

  const callbackId = callback.id;

  async function act(action: CallbackAction, actionNote?: string) {
    setIsSaving(true);
    setError('');
    try {
      const data = await updateCallback(callbackId, action, actionNote);
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status);
      }
      setIsNoteOpen(false);
      setNote('');
      await onChanged();
    } catch (err: any) {
      setError(err?.message || 'Could not update the callback.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="callback-actions">
      <span className="callback-badge">Needs callback</span>
      {!isNoteOpen && (
        <>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isSaving}
            onClick={() => act('assign')}
          >
            I&apos;ll call
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSaving}
            onClick={() => setIsNoteOpen(true)}
          >
            Mark called
          </button>
        </>
      )}
      {isNoteOpen && (
        <div className="callback-note-form">
          <input
            type="text"
            value={note}
            maxLength={2000}
            placeholder="Note (optional)"
            aria-label="Callback note (optional)"
            onChange={(event) => setNote(event.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isSaving}
            onClick={() => {
              setIsNoteOpen(false);
              setNote('');
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSaving}
            onClick={() => act('complete', note.trim() || undefined)}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
      {error && <small className="callback-error" role="alert">{error}</small>}
    </div>
  );
}
