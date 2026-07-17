import React, { useEffect, useMemo, useState } from 'react';

import {
  addCommunicationContactPhone,
  CommunicationContact,
  CommunicationContactPhone,
  deactivateCommunicationContactPhone,
  getCommunicationContactReferences,
  mergeCommunicationContact,
  promoteCommunicationContactPhone,
  PromoteSharedResponse,
  updateCommunicationContact,
  updateCommunicationContactPhone,
} from './communicationsApi';

type ContactEditorSheetProps = {
  contact: CommunicationContact;
  contacts: CommunicationContact[];
  onClose: () => void;
  onChanged: (contact: CommunicationContact) => void;
  onSelectContact: (contactId: string) => void;
  onPromoted: (result: PromoteSharedResponse) => void;
};

function displayPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function contactTypeLabel(contact: CommunicationContact) {
  if (contact.type === 'PERSON') return 'Client';
  if (contact.type === 'COLD') return 'Unattached contact';
  return 'Shared number';
}

type PhoneRowProps = {
  contact: CommunicationContact;
  phone: CommunicationContactPhone;
  onChanged: (contact: CommunicationContact) => void;
  onSelectContact: (contactId: string) => void;
  onStartPromotion: (phone: CommunicationContactPhone) => void;
};

function PhoneRow({ contact, phone, onChanged, onSelectContact, onStartPromotion }: PhoneRowProps) {
  const [label, setLabel] = useState(phone.label || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setLabel(phone.label || ''), [phone.id, phone.label]);

  async function updatePhone(update: { position?: 'primary' | 'secondary'; label?: string }) {
    setIsSaving(true);
    setError('');
    try {
      const response = await updateCommunicationContactPhone(contact.id, phone.id, update);
      if (!response.contact) throw new Error(response.message || response.status);
      onChanged(response.contact);
    } catch (requestError) {
      setError(errorMessage(requestError));
      setLabel(phone.label || '');
    } finally {
      setIsSaving(false);
    }
  }

  async function removePhone() {
    if (!window.confirm(`Remove ${displayPhone(phone.phoneNumber)} from this contact?`)) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await deactivateCommunicationContactPhone(contact.id, phone.id);
      if (!response.contact) throw new Error(response.message || response.status);
      onChanged(response.contact);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="contact-phone-row">
      <div className="contact-phone-row-heading">
        <div>
          <strong>{displayPhone(phone.phoneNumber)}</strong>
          <span className={`contact-badge ${phone.relationship === 'shared_reference' ? 'shared' : ''}`}>
            {phone.relationship === 'shared_reference' ? 'Shared reference' : phone.position}
          </span>
        </div>
        <button type="button" className="contact-text-button danger" disabled={isSaving} onClick={removePhone}>
          Remove
        </button>
      </div>
      <label>
        Number label
        <input
          value={label}
          disabled={isSaving}
          placeholder="Mobile, shelter, caseworker..."
          onChange={(event) => setLabel(event.target.value)}
          onBlur={() => {
            if (label.trim() !== (phone.label || '')) updatePhone({ label: label.trim() });
          }}
        />
      </label>
      <div className="contact-phone-actions">
        {phone.relationship === 'routing_owner' && phone.position !== 'primary' && (
          <button type="button" disabled={isSaving} onClick={() => updatePhone({ position: 'primary' })}>
            Make primary
          </button>
        )}
        {!contact.shared && phone.relationship === 'routing_owner' && (
          <button type="button" disabled={isSaving} onClick={() => onStartPromotion(phone)}>
            Mark as shared number
          </button>
        )}
        {phone.relationship === 'shared_reference' && phone.routingContactId && (
          <button type="button" onClick={() => onSelectContact(phone.routingContactId!)}>
            Open {phone.routingContactLabel || 'shared thread'}
          </button>
        )}
      </div>
      {error && <p className="contact-form-error">{error}</p>}
    </article>
  );
}

export default function ContactEditorSheet({
  contact,
  contacts,
  onClose,
  onChanged,
  onSelectContact,
  onPromoted,
}: ContactEditorSheetProps) {
  const [label, setLabel] = useState(contact.label || '');
  const [newPhone, setNewPhone] = useState('');
  const [newPhoneLabel, setNewPhoneLabel] = useState('');
  const [newPhonePosition, setNewPhonePosition] = useState<'primary' | 'secondary'>('secondary');
  const [sharedReference, setSharedReference] = useState(false);
  const [linkTarget, setLinkTarget] = useState('');
  const [promotionPhone, setPromotionPhone] = useState<CommunicationContactPhone | null>(null);
  const [sharedLabel, setSharedLabel] = useState('');
  const [references, setReferences] = useState<CommunicationContact[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const personContacts = useMemo(
    () => contacts.filter((candidate) => candidate.type === 'PERSON' && candidate.id !== contact.id),
    [contacts, contact.id],
  );

  useEffect(() => {
    setLabel(contact.label || '');
    setNewPhone('');
    setNewPhoneLabel('');
    setNewPhonePosition(contact.phones.length ? 'secondary' : 'primary');
    setSharedReference(false);
    setLinkTarget('');
    setPromotionPhone(null);
    setSharedLabel('');
    setError('');
    setNotice('');
  }, [contact.id]);

  useEffect(() => {
    let cancelled = false;
    if (!contact.shared) {
      setReferences([]);
      return undefined;
    }
    getCommunicationContactReferences(contact.id)
      .then((response) => {
        if (!cancelled && response.status === 'SUCCESS') setReferences(response.contacts);
      })
      .catch(() => {
        if (!cancelled) setReferences([]);
      });
    return () => {
      cancelled = true;
    };
  }, [contact.id, contact.shared]);

  async function saveLabel() {
    if (contact.type === 'PERSON' || label.trim() === (contact.label || '')) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await updateCommunicationContact(contact.id, { label: label.trim() });
      if (!response.contact) throw new Error(response.message || response.status);
      onChanged(response.contact);
      setNotice('Contact label saved.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  async function addPhone() {
    if (!newPhone.trim()) return;
    setIsSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await addCommunicationContactPhone(
        contact.id,
        newPhone.trim(),
        sharedReference ? 'secondary' : newPhonePosition,
        newPhoneLabel.trim(),
        sharedReference,
      );
      if (!response.contact) throw new Error(response.message || response.status);
      onChanged(response.contact);
      setNewPhone('');
      setNewPhoneLabel('');
      setNewPhonePosition('secondary');
      setSharedReference(false);
      setNotice('Phone number added.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  async function linkClient() {
    if (!linkTarget) return;
    const destination = personContacts.find((candidate) => candidate.id === linkTarget);
    if (!destination || !window.confirm(`Attach this thread to ${destination.displayName}? The histories will be combined.`)) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await mergeCommunicationContact(contact.id, linkTarget);
      if (!response.contact) throw new Error(response.message || response.status);
      onChanged(response.contact);
      onSelectContact(response.contact.id);
      onClose();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  async function promotePhone() {
    if (!promotionPhone || !sharedLabel.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await promoteCommunicationContactPhone(
        contact.id,
        promotionPhone.id,
        sharedLabel.trim(),
      );
      if (!response.sharedContact) throw new Error(response.message || response.status);
      onPromoted(response);
      onClose();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="contact-sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="contact-sheet"
        aria-label={`Edit ${contact.displayName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="contact-sheet-header">
          <div>
            <p className="communications-kicker">Communication contact</p>
            <h2>{contact.displayName}</h2>
            <span className={`contact-type-pill ${contact.type.toLowerCase()}`}>
              {contactTypeLabel(contact)}
            </span>
          </div>
          <button type="button" className="contact-sheet-close" onClick={onClose} aria-label="Close contact editor">×</button>
        </header>

        <div className="contact-sheet-scroll">
          {contact.type === 'PERSON' ? (
            <section className="contact-sheet-section">
              <h3>Contact name</h3>
              <p className="contact-form-help">This label follows the linked client profile: {contact.displayName}.</p>
            </section>
          ) : (
            <section className="contact-sheet-section">
              <h3>Contact label</h3>
              <label>
                Label
                <input
                  value={label}
                  disabled={isSaving}
                  placeholder={contact.shared ? 'Shelter front desk' : 'Unknown caller'}
                  onChange={(event) => setLabel(event.target.value)}
                />
              </label>
              <button type="button" className="contact-primary-button" disabled={isSaving || !label.trim()} onClick={saveLabel}>
                Save label
              </button>
            </section>
          )}

          {contact.type === 'COLD' && (
            <section className="contact-sheet-section">
              <h3>Attach to a client</h3>
              <p className="contact-form-help">This combines the cold-call history with the selected client’s communication thread.</p>
              <select value={linkTarget} onChange={(event) => setLinkTarget(event.target.value)}>
                <option value="">Select a client</option>
                {personContacts.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>{candidate.displayName}</option>
                ))}
              </select>
              <button type="button" className="contact-primary-button" disabled={isSaving || !linkTarget} onClick={linkClient}>
                Attach and combine
              </button>
            </section>
          )}

          <section className="contact-sheet-section">
            <h3>Phone numbers</h3>
            {contact.phones.length === 0 && (
              <p className="contact-form-help">No active phone numbers. Notes can still be kept on this contact.</p>
            )}
            <div className="contact-phone-list">
              {contact.phones.map((contactPhone) => (
                <PhoneRow
                  key={contactPhone.id}
                  contact={contact}
                  phone={contactPhone}
                  onChanged={onChanged}
                  onSelectContact={onSelectContact}
                  onStartPromotion={(selectedPhone) => {
                    setPromotionPhone(selectedPhone);
                    setSharedLabel(selectedPhone.label || 'Shared number');
                    setError('');
                  }}
                />
              ))}
            </div>
          </section>

          {promotionPhone && (
            <section className="contact-sheet-section contact-promotion-card">
              <h3>Move this number to a shared thread?</h3>
              <p className="contact-form-help">
                Messages and calls involving {displayPhone(promotionPhone.phoneNumber)} will move out of this contact and into a new shared contact.
              </p>
              <label>
                Shared contact label
                <input value={sharedLabel} onChange={(event) => setSharedLabel(event.target.value)} />
              </label>
              <div className="contact-inline-actions">
                <button type="button" onClick={() => setPromotionPhone(null)}>Cancel</button>
                <button type="button" className="contact-primary-button" disabled={isSaving || !sharedLabel.trim()} onClick={promotePhone}>
                  Move to shared thread
                </button>
              </div>
            </section>
          )}

          <section className="contact-sheet-section">
            <h3>Add a phone number</h3>
            <label>
              Phone number
              <input value={newPhone} placeholder="(215) 555-0100" onChange={(event) => setNewPhone(event.target.value)} />
            </label>
            <label>
              Number label
              <input value={newPhoneLabel} placeholder="Mobile, secondary, shelter..." onChange={(event) => setNewPhoneLabel(event.target.value)} />
            </label>
            <label className="contact-checkbox-label">
              <input
                type="checkbox"
                checked={sharedReference}
                onChange={(event) => setSharedReference(event.target.checked)}
              />
              This is an existing shared or public number
            </label>
            {!sharedReference && (
              <label>
                Priority
                <select value={newPhonePosition} onChange={(event) => setNewPhonePosition(event.target.value as 'primary' | 'secondary')}>
                  <option value="secondary">Secondary</option>
                  <option value="primary">Primary</option>
                </select>
              </label>
            )}
            <button type="button" className="contact-primary-button" disabled={isSaving || !newPhone.trim()} onClick={addPhone}>
              Add phone number
            </button>
          </section>

          {contact.shared && (
            <section className="contact-sheet-section">
              <h3>Possible client references</h3>
              <p className="contact-form-help">These client contacts also list this public or shared number.</p>
              {references.length === 0 ? (
                <p className="contact-form-help">No client contacts currently reference this number.</p>
              ) : references.map((reference) => (
                <button
                  type="button"
                  key={reference.id}
                  className="contact-reference-row"
                  onClick={() => onSelectContact(reference.id)}
                >
                  <span>{reference.displayName}</span>
                  <span>Open thread →</span>
                </button>
              ))}
            </section>
          )}

          {notice && <p className="contact-form-notice">{notice}</p>}
          {error && <p className="contact-form-error">{error}</p>}
        </div>
      </aside>
    </div>
  );
}
