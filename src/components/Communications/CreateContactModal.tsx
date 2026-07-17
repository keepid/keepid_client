import React, { useState } from 'react';

import { CommunicationContact, createCommunicationContact } from './communicationsApi';

type CreateContactModalProps = {
  onClose: () => void;
  onCreated: (contact: CommunicationContact) => void;
};

export default function CreateContactModal({ onClose, onCreated }: CreateContactModalProps) {
  const [label, setLabel] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function createContact() {
    if (!label.trim() && !phoneNumber.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await createCommunicationContact(label.trim(), phoneNumber.trim() || undefined);
      if (!response.contact) throw new Error(response.message || response.status);
      onCreated(response.contact);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create this contact.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="schedule-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="schedule-modal contact-create-modal"
        aria-label="Create communication contact"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="call-close" onClick={onClose} aria-label="Close create contact modal">×</button>
        <div>
          <p className="communications-kicker">New communication contact</p>
          <h2>Start a cold-contact thread</h2>
          <p className="contact-form-help">You can keep call notes even without a phone number, then attach this thread to a client later.</p>
        </div>
        <label>
          Contact label
          <input
            value={label}
            placeholder="Unknown caller, outreach lead..."
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>
        <label>
          Phone number (optional)
          <input
            value={phoneNumber}
            inputMode="tel"
            placeholder="(215) 555-0100"
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </label>
        {error && <p className="contact-form-error">{error}</p>}
        <div className="schedule-modal-actions">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSaving || (!label.trim() && !phoneNumber.trim())}
            onClick={createContact}
          >
            {isSaving ? 'Creating...' : 'Create contact'}
          </button>
        </div>
      </section>
    </div>
  );
}
