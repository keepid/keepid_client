import './communications.css';

import AddIcon from '@mui/icons-material/Add';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { Call } from '@twilio/voice-sdk';
import { Device } from '@twilio/voice-sdk';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import CallTranscript from './CallTranscript';
import {
  addCommunicationContactNote,
  CommunicationContact,
  formatDuration,
  getCallRecordingPlaybackUrl,
  getCommunicationContact,
  getCommunicationContacts,
  getCommunicationContactTimeline,
  getTwilioVoiceToken,
  MessageBoardItem,
  PromoteSharedResponse,
  scheduleCommunicationContactMessage,
  sendCommunicationContactMessage,
  updateCommunicationContactNote,
} from './communicationsApi';
import ContactEditorSheet from './ContactEditorSheet';
import CreateContactModal from './CreateContactModal';

type BrowserCallStatus = 'idle' | 'connecting' | 'ringing' | 'in-call' | 'ended' | 'error';
type CommunicationsLocationState = {
  clientUsername?: string;
  clientName?: string;
  clientPhone?: string;
};

const CONVERSATION_POLL_MS = 25000;
const THREAD_POLL_MS = 12000;

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
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function itemSide(item: MessageBoardItem) {
  if (item.type === 'message' || item.type === 'voicemail') return item.metadata === 'outbound' ? 'right' : 'left';
  return 'center';
}

function orderedItems(itemsToOrder: MessageBoardItem[]) {
  const timestamp = (item: MessageBoardItem) => new Date(item.occurredAt || item.noteDate || 0).getTime();
  return [...itemsToOrder].sort((a, b) => {
    if (a.type === 'scheduled' && b.type !== 'scheduled') return 1;
    if (a.type !== 'scheduled' && b.type === 'scheduled') return -1;
    return timestamp(a) - timestamp(b);
  });
}

function conversationKey(conversation?: CommunicationContact) {
  if (!conversation) return '';
  return conversation.id;
}

function conversationLabel(conversation: CommunicationContact) {
  return conversation.displayName;
}

function contactTypeLabel(contact: CommunicationContact) {
  if (contact.type === 'PERSON') return 'Client';
  if (contact.type === 'COLD') return 'Unattached';
  return 'Shared number';
}

function itemTitle(item: MessageBoardItem) {
  if (item.type === 'message') return 'SMS message';
  if (item.type === 'voicemail') {
    return 'Voice Mail Transcript';
  }
  return item.title;
}

function recordingPlaybackUrl(item: MessageBoardItem) {
  if (!item.recordingUrl || (item.type !== 'call' && item.type !== 'voicemail')) return '';
  return getCallRecordingPlaybackUrl(item.sourceId);
}

function conversationInitial(conversation: CommunicationContact) {
  return conversationLabel(conversation).replace(/\W/g, '').charAt(0).toUpperCase() || '?';
}

function callStatusText(status: BrowserCallStatus) {
  switch (status) {
    case 'connecting':
      return 'Connecting through Keep.id...';
    case 'ringing':
      return 'Ringing...';
    case 'in-call':
      return 'In call';
    case 'ended':
      return 'Call ended';
    case 'error':
      return 'Call could not connect';
    case 'idle':
    default:
      return 'Ready to call from the Keep.id hotline.';
  }
}

function openSelectedClient(conversation: CommunicationContact, history: ReturnType<typeof useHistory>) {
  if (conversation.username) {
    history.push(`/profile/${encodeURIComponent(conversation.username)}`);
    return;
  }
  const params = new URLSearchParams();
  if (conversation.primaryPhone) params.set('phone', conversation.primaryPhone);
  history.push(`/enroll-client${params.toString() ? `?${params.toString()}` : ''}`);
}

export default function CallsPage() {
  const history = useHistory();
  const location = useLocation<CommunicationsLocationState | undefined>();
  const [conversations, setConversations] = useState<CommunicationContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [items, setItems] = useState<MessageBoardItem[]>([]);
  const [search, setSearch] = useState('');
  const [contactType, setContactType] = useState('');
  const [selectedPhone, setSelectedPhone] = useState('');
  const [composerMode, setComposerMode] = useState<'message' | 'note'>('message');
  const [message, setMessage] = useState('');
  const [scheduleBody, setScheduleBody] = useState('');
  const [scheduleSendAt, setScheduleSendAt] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [browserCallStatus, setBrowserCallStatus] = useState<BrowserCallStatus>('idle');
  const [browserCallError, setBrowserCallError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [callNoteDraft, setCallNoteDraft] = useState('');
  const [callNoteSaveError, setCallNoteSaveError] = useState('');
  const [isSavingCallNote, setIsSavingCallNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState('');
  const [editNoteDraft, setEditNoteDraft] = useState('');
  const [isSavingEditedNote, setIsSavingEditedNote] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [conversationError, setConversationError] = useState('');
  const [threadError, setThreadError] = useState('');
  const [contactNotice, setContactNotice] = useState('');
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);
  const [isContactEditorOpen, setIsContactEditorOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const voiceDeviceRef = React.useRef<Device | null>(null);
  const activeCallRef = React.useRef<Call | null>(null);

  const requestedClientUsername = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('client') || location.state?.clientUsername || '').trim();
  }, [location.search, location.state]);

  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedContactId) || conversations[0],
    [conversations, selectedContactId],
  );

  const sendablePhones = useMemo(() => {
    const routingPhones = (selected?.phones || []).filter((contactPhone) => contactPhone.relationship === 'routing_owner');
    if (routingPhones.length) return routingPhones;
    return selected?.primaryPhone ? [{ id: selected.primaryPhone, phoneNumber: selected.primaryPhone }] : [];
  }, [selected]);

  const visibleItems = useMemo(() => orderedItems(items).filter((item) => item.type !== 'scheduled'), [items]);
  const scheduledItems = useMemo(() => orderedItems(items).filter((item) => item.type === 'scheduled'), [items]);
  const scheduledItem = scheduledItems[0];

  async function loadConversations(options: { silent?: boolean } = {}) {
    try {
      const data = await getCommunicationContacts(search, contactType);
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status);
      }
      setConversations((current) => data.contacts.map((contact) => {
        const loaded = current.find((candidate) => candidate.id === contact.id);
        return loaded?.phones.length ? { ...contact, phones: loaded.phones } : contact;
      }));
      setSelectedContactId((current) => {
        const requestedConversation = requestedClientUsername
          ? data.contacts.find((conversation) => (
            conversation.username === requestedClientUsername
            || conversationKey(conversation) === requestedClientUsername
          ))
          : undefined;
        if (!current && requestedConversation) {
          return conversationKey(requestedConversation);
        }
        if (current && data.contacts.some((conversation) => conversationKey(conversation) === current)) {
          return current;
        }
        if (requestedConversation) {
          return conversationKey(requestedConversation);
        }
        return conversationKey(data.contacts[0]);
      });
      setConversationError('');
    } catch (error) {
      if (!options.silent) {
        setConversations([]);
        setSelectedContactId('');
        setConversationError(error instanceof Error ? error.message : 'Could not load conversations.');
      }
    }
  }

  async function loadThread(conversation: CommunicationContact, options: { silent?: boolean } = {}) {
    if (!options.silent) setIsLoadingThread(true);
    try {
      const [data, contactResponse] = await Promise.all([
        getCommunicationContactTimeline(conversation.id),
        getCommunicationContact(conversation.id),
      ]);
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status);
      }
      setItems(data.items);
      if (contactResponse.contact) {
        const loadedContact = contactResponse.contact;
        setConversations((current) => current.map((candidate) => (
          candidate.id === loadedContact.id ? loadedContact : candidate
        )));
      }
      setThreadError('');
    } catch (error) {
      if (!options.silent) {
        setItems([]);
        setThreadError(error instanceof Error ? error.message : 'Could not load this conversation.');
      }
    } finally {
      if (!options.silent) setIsLoadingThread(false);
    }
  }

  async function handleRefreshConversation() {
    await loadConversations();
    if (selected?.id) {
      await loadThread(selected);
    }
  }

  useEffect(() => {
    if (requestedClientUsername) {
      setSelectedContactId('');
    }
    loadConversations();
  }, [requestedClientUsername, contactType]);

  useEffect(() => {
    if (selected?.id) {
      loadThread(selected);
    } else if (selected) {
      setItems([]);
      setThreadError('');
    }
  }, [selected?.id]);

  useEffect(() => {
    let stopped = false;

    async function refreshConversationList() {
      if (stopped || document.hidden) return;
      await loadConversations({ silent: true });
    }

    async function refreshActiveThread() {
      if (stopped || document.hidden) return;
      const current = selected;
      if (current?.id) {
        await loadThread(current, { silent: true });
      }
    }

    async function refreshCommunications() {
      await refreshConversationList();
      await refreshActiveThread();
    }

    const conversationInterval = window.setInterval(refreshConversationList, CONVERSATION_POLL_MS);
    const threadInterval = window.setInterval(refreshActiveThread, THREAD_POLL_MS);
    const handleFocus = () => {
      refreshCommunications();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshCommunications();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopped = true;
      window.clearInterval(conversationInterval);
      window.clearInterval(threadInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selected?.id, search, contactType]);

  useEffect(() => {
    if (isLoadingThread) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const scrollEl = chatScrollRef.current;
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [conversationKey(selected), isLoadingThread, visibleItems.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) => (
      conversationLabel(conversation).toLowerCase().includes(q)
      || conversation.displayName.toLowerCase().includes(q)
      || (conversation.username || '').toLowerCase().includes(q)
      || conversation.primaryPhone?.toLowerCase().includes(q)
    ));
  }, [conversations, search]);

  useEffect(() => {
    setIsScheduleModalOpen(false);
    setScheduleBody('');
    setScheduleSendAt('');
  }, [selected?.id]);

  useEffect(() => {
    const primary = sendablePhones.find((contactPhone) => (
      'position' in contactPhone && contactPhone.position === 'primary'
    ));
    setSelectedPhone(primary?.phoneNumber || sendablePhones[0]?.phoneNumber || '');
  }, [selected?.id, selected?.phones, selected?.primaryPhone]);

  useEffect(() => {
    if (browserCallStatus !== 'in-call' || !callStartedAt) return undefined;
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - callStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [browserCallStatus, callStartedAt]);

  useEffect(() => () => {
    activeCallRef.current?.disconnect();
    voiceDeviceRef.current?.destroy();
  }, []);

  function defaultScheduleTime() {
    const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    tomorrow.setHours(9, 0, 0, 0);
    return localInputValue(tomorrow);
  }

  function localDateTimeValue(value?: string) {
    if (!value) return defaultScheduleTime();
    return localInputValue(new Date(value));
  }

  function localInputValue(date: Date) {
    const offset = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  async function handleSend(schedule: boolean, scheduledBody = message, scheduledSendAt = '') {
    if (!selected?.id || !selectedPhone || !scheduledBody.trim()) return;
    setThreadError('');
    try {
      if (schedule) {
        await scheduleCommunicationContactMessage(
          selected.id,
          scheduledBody,
          new Date(scheduledSendAt).toISOString(),
          selectedPhone,
        );
      } else {
        await sendCommunicationContactMessage(selected.id, message, selectedPhone);
      }
      await loadThread(selected);
      await loadConversations();
      if (!schedule) setMessage('');
    } catch (error) {
      setThreadError(error instanceof Error ? error.message : 'Could not send this message.');
    }
  }

  async function handleAddNote() {
    if (!selected?.id || !message.trim()) return;
    setThreadError('');
    try {
      const data = await addCommunicationContactNote(selected.id, message.trim());
      if (data.status !== 'SUCCESS') throw new Error(data.message || data.status);
      setItems(data.items);
      setMessage('');
      await loadConversations();
    } catch (error) {
      setThreadError(error instanceof Error ? error.message : 'Could not save this note.');
    }
  }

  function handleScheduleClick() {
    if (!selected?.id || !selectedPhone) return;
    const body = scheduledItem?.body || message;
    if (!body?.trim()) return;
    setScheduleBody(body);
    setScheduleSendAt(localDateTimeValue(scheduledItem?.occurredAt));
    setIsScheduleModalOpen(true);
  }

  async function handleSaveSchedule() {
    if (!selected?.id || !selectedPhone || !scheduleBody.trim() || !scheduleSendAt) return;
    await handleSend(true, scheduleBody, scheduleSendAt);
    setMessage('');
    setScheduleBody('');
    setScheduleSendAt('');
    setIsScheduleModalOpen(false);
  }

  function resetBrowserCallState() {
    setBrowserCallStatus('idle');
    setBrowserCallError('');
    setIsMuted(false);
    setCallStartedAt(null);
    setElapsedSeconds(0);
  }

  function closeCallModal() {
    activeCallRef.current?.disconnect();
    activeCallRef.current = null;
    voiceDeviceRef.current?.destroy();
    voiceDeviceRef.current = null;
    setIsCalling(false);
    resetBrowserCallState();
    setCallNoteSaveError('');
  }

  async function saveCallNoteAndClose() {
    if (!selected?.id) {
      setCallNoteSaveError('Select a communication contact before saving notes.');
      return;
    }
    const note = callNoteDraft.trim();
    setIsSavingCallNote(true);
    setCallNoteSaveError('');
    try {
      if (note) {
        await addCommunicationContactNote(selected.id, note, undefined, true);
        setCallNoteDraft('');
      }
      closeCallModal();
      await loadThread(selected);
      await loadConversations();
    } catch (error) {
      setCallNoteSaveError(error instanceof Error ? error.message : 'Could not save this note.');
    } finally {
      setIsSavingCallNote(false);
    }
  }

  async function handleSaveEditedNote() {
    if (!selected?.id || !editingNoteId || !editNoteDraft.trim()) return;
    setIsSavingEditedNote(true);
    try {
      const data = await updateCommunicationContactNote(selected.id, editingNoteId, editNoteDraft.trim());
      if (data.status !== 'SUCCESS') {
        throw new Error(data.message || data.status);
      }
      setItems(data.items);
      setEditingNoteId('');
      setEditNoteDraft('');
      await loadConversations();
    } finally {
      setIsSavingEditedNote(false);
    }
  }

  async function refreshSelectedConversation() {
    if (selected?.id) {
      await loadThread(selected);
      await loadConversations();
    }
  }

  async function startBrowserCall() {
    if (!selectedPhone || browserCallStatus === 'connecting' || browserCallStatus === 'ringing' || browserCallStatus === 'in-call') return;
    setBrowserCallError('');
    setBrowserCallStatus('connecting');
    setElapsedSeconds(0);
    setCallStartedAt(null);
    try {
      if (!Device.isSupported) {
        throw new Error('This browser does not support Twilio Voice calling.');
      }
      const tokenResponse = await getTwilioVoiceToken();
      if (tokenResponse.status !== 'SUCCESS' || !tokenResponse.token) {
        throw new Error(tokenResponse.message || tokenResponse.status || 'Twilio Voice is not configured.');
      }
      voiceDeviceRef.current?.destroy();
      const device = new Device(tokenResponse.token);
      voiceDeviceRef.current = device;
      device.on('error', (error: Error) => {
        setBrowserCallError(error.message || 'Twilio Voice connection failed.');
        setBrowserCallStatus('error');
      });
      await device.register();
      const call = await device.connect({ params: { To: selectedPhone } });
      activeCallRef.current = call;
      setBrowserCallStatus('ringing');
      call.on('accept', () => {
        setBrowserCallStatus('in-call');
        setBrowserCallError('');
        setCallStartedAt(Date.now());
        setElapsedSeconds(0);
      });
      call.on('disconnect', () => {
        activeCallRef.current = null;
        setBrowserCallStatus('ended');
        setCallStartedAt(null);
        setIsMuted(false);
        refreshSelectedConversation();
      });
      call.on('cancel', () => {
        activeCallRef.current = null;
        setBrowserCallStatus('ended');
        setCallStartedAt(null);
        setIsMuted(false);
      });
      call.on('reject', () => {
        activeCallRef.current = null;
        setBrowserCallStatus('ended');
        setCallStartedAt(null);
        setIsMuted(false);
      });
      call.on('error', (error: Error) => {
        activeCallRef.current = null;
        setBrowserCallError(error.message || 'Twilio Voice call failed.');
        setBrowserCallStatus('error');
        setCallStartedAt(null);
        setIsMuted(false);
      });
      call.on('reconnecting', () => {
        setBrowserCallStatus('connecting');
      });
      call.on('reconnected', () => {
        setBrowserCallStatus('in-call');
      });
    } catch (error) {
      activeCallRef.current = null;
      voiceDeviceRef.current?.destroy();
      voiceDeviceRef.current = null;
      setBrowserCallError(error instanceof Error ? error.message : 'Could not start the browser call.');
      setBrowserCallStatus('error');
      setCallStartedAt(null);
      setIsMuted(false);
    }
  }

  function toggleMute() {
    const call = activeCallRef.current;
    if (!call || browserCallStatus !== 'in-call') return;
    const nextMuted = !isMuted;
    call.mute(nextMuted);
    setIsMuted(nextMuted);
  }

  function hangUpCall() {
    activeCallRef.current?.disconnect();
    activeCallRef.current = null;
    voiceDeviceRef.current?.disconnectAll();
    setBrowserCallStatus('ended');
    setCallStartedAt(null);
    setIsMuted(false);
  }

  function updateContactInList(contact: CommunicationContact) {
    setConversations((current) => {
      const exists = current.some((candidate) => candidate.id === contact.id);
      if (!exists) return [contact, ...current];
      return current.map((candidate) => candidate.id === contact.id ? contact : candidate);
    });
  }

  function handleContactPromotion(result: PromoteSharedResponse) {
    if (!result.sharedContact) return;
    updateContactInList(result.sharedContact);
    setSelectedContactId(result.sharedContact.id);
    setContactNotice(
      `Shared thread created. Moved ${result.moved.messages} messages, ${result.moved.calls} calls, and ${result.moved.callNotes} call notes.`,
    );
    loadConversations({ silent: true });
  }

  return (
    <main className="communications-shell">
      <aside className="conversation-list" aria-label="Conversation contacts">
        <div className="conversation-list-header">
          <div>
            <p className="communications-kicker">Communications</p>
            <h1>Contacts</h1>
          </div>
          <button
            type="button"
            className="conversation-add"
            onClick={() => setIsCreateContactOpen(true)}
            aria-label="Create communication contact"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>
        <input
          className="conversation-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') loadConversations();
          }}
          placeholder="Search names or phone numbers"
        />
        <div className="contact-type-filters" aria-label="Filter communication contacts">
          {[
            { value: '', label: 'All' },
            { value: 'PERSON', label: 'Clients' },
            { value: 'COLD', label: 'Cold' },
            { value: 'SHARED', label: 'Shared' },
          ].map((filter) => (
            <button
              type="button"
              key={filter.value || 'all'}
              className={contactType === filter.value ? 'active' : ''}
              onClick={() => {
                setContactNotice('');
                setContactType(filter.value);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="contact-scroll">
          {conversationError && <p className="communications-muted">{conversationError}</p>}
          {!conversationError && filtered.length === 0 && (
            <p className="communications-muted">No communication contacts found.</p>
          )}
          {filtered.map((conversation) => {
            const label = conversationLabel(conversation);
            return (
              <button
                type="button"
                key={conversationKey(conversation)}
                className={`contact-row ${conversationKey(selected) === conversationKey(conversation) ? 'active' : ''}`}
                onClick={() => {
                  setContactNotice('');
                  setComposerMode('message');
                  setMessage('');
                  setSelectedContactId(conversation.id);
                }}
              >
                <span className={`contact-avatar ${conversation.type.toLowerCase()}`}>{conversationInitial(conversation)}</span>
                <span className="contact-main">
                  <strong>
                    {label}
                    {conversation.type !== 'PERSON' && (
                      <span className={`contact-list-type ${conversation.type.toLowerCase()}`}>
                        {conversation.type === 'SHARED' ? 'Shared' : 'Cold'}
                      </span>
                    )}
                  </strong>
                  <small>{conversation.lastPreview || 'No recent activity'}</small>
                </span>
                <span className="contact-meta">
                  <small>{formatTime(conversation.lastActivityAt)}</small>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="chat-panel" aria-label="Selected conversation">
        {selected ? (
          <>
            <header className="chat-header">
              <div>
                <div className="chat-contact-title">
                  <h2>{conversationLabel(selected)}</h2>
                  <span className={`contact-type-pill ${selected.type.toLowerCase()}`}>
                    {contactTypeLabel(selected)}
                  </span>
                </div>
                <p>
                  {selected.primaryPhone ? `${phone(selected.primaryPhone)} · ` : ''}
                  {selected.messageCount} messages · {selected.callCount} calls · {selected.noteCount} notes
                </p>
              </div>
              <div className="chat-actions">
                {!selected.shared && (
                  <button type="button" className="btn btn-outline-secondary" onClick={() => openSelectedClient(selected, history)}>
                    {selected.username ? 'Profile' : 'Enroll'}
                  </button>
                )}
                <button type="button" className="btn btn-outline-secondary" onClick={() => setIsContactEditorOpen(true)}>Edit contact</button>
                <button type="button" className="btn btn-primary" disabled={!selectedPhone} onClick={() => setIsCalling(true)}>Call</button>
                <button
                  type="button"
                  className="chat-icon-action"
                  onClick={handleRefreshConversation}
                  aria-label="Refresh conversations"
                >
                  <RefreshOutlinedIcon fontSize="small" />
                </button>
              </div>
            </header>

            <div className="chat-scroll" ref={chatScrollRef}>
              {contactNotice && (
                <div className="contact-move-notice">
                  <span>{contactNotice}</span>
                  <button type="button" onClick={() => setContactNotice('')} aria-label="Dismiss notice">×</button>
                </div>
              )}
              {isLoadingThread && <p className="communications-muted">Loading conversation...</p>}
              {threadError && <p className="communications-muted">{threadError}</p>}
              {!isLoadingThread && !threadError && visibleItems.length === 0 && (
                <p className="communications-muted">No messages, calls, or notes yet.</p>
              )}
              {visibleItems.map((item) => {
                const side = itemSide(item);
                const title = itemTitle(item);
                const recordingUrl = recordingPlaybackUrl(item);
                return (
                  <article key={`${item.type}-${item.sourceId}`} className={`chat-item ${side} ${item.type}`}>
                    <div className="chat-bubble">
                      <div className="chat-item-top">
                        <strong>{title}</strong>
                        <span>
                          {formatTime(item.occurredAt)}
                          {item.type === 'note' && (
                            <button
                              type="button"
                              className="timeline-edit-button"
                              onClick={() => {
                                setEditingNoteId(item.sourceId);
                                setEditNoteDraft(item.body || '');
                              }}
                              aria-label="Edit communication note"
                            >
                              <PencilIcon />
                            </button>
                          )}
                        </span>
                      </div>
                      {editingNoteId === item.sourceId ? (
                        <div className="timeline-edit-form">
                          <textarea
                            value={editNoteDraft}
                            onChange={(event) => setEditNoteDraft(event.target.value)}
                            rows={3}
                          />
                          <div>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                setEditingNoteId('');
                                setEditNoteDraft('');
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={!editNoteDraft.trim() || isSavingEditedNote}
                              onClick={handleSaveEditedNote}
                            >
                              {isSavingEditedNote ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        item.body && (
                          item.type === 'call'
                            ? <CallTranscript transcript={item.body} />
                            : <p>{item.body}</p>
                        )
                      )}
                      {recordingUrl && (
                        <div className="recording-player">
                          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                          <audio controls preload="none" src={recordingUrl}>
                            Recording playback is not supported in this browser.
                          </audio>
                          <a href={recordingUrl} target="_blank" rel="noreferrer">Open recording</a>
                        </div>
                      )}
                      {item.status && item.type !== 'call' && item.type !== 'voicemail' && <small>{item.status}</small>}
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="chat-composer">
              {composerMode === 'message' && scheduledItem && (
                <div className="scheduled-stack">
                  <section className="scheduled-preview existing">
                    <div>
                      <strong>Scheduled SMS</strong>
                      <p>{scheduledItem.body}</p>
                    </div>
                    <div className="scheduled-preview-actions">
                      <span>{formatTime(scheduledItem.occurredAt)}</span>
                      <button type="button" onClick={handleScheduleClick} aria-label="Edit scheduled SMS">
                        <PencilIcon />
                      </button>
                    </div>
                  </section>
                </div>
              )}
              <div className="composer-mode-toggle" aria-label="Choose communication type">
                <button
                  type="button"
                  className={composerMode === 'message' ? 'active' : ''}
                  onClick={() => setComposerMode('message')}
                >
                  SMS message
                </button>
                <button
                  type="button"
                  className={composerMode === 'note' ? 'active' : ''}
                  onClick={() => setComposerMode('note')}
                >
                  Internal note
                </button>
              </div>
              {composerMode === 'message' && sendablePhones.length > 1 && (
                <label className="composer-phone-select">
                  Send to
                  <select value={selectedPhone} onChange={(event) => setSelectedPhone(event.target.value)}>
                    {sendablePhones.map((contactPhone) => (
                      <option key={contactPhone.id} value={contactPhone.phoneNumber}>
                        {phone(contactPhone.phoneNumber)}
                        {'label' in contactPhone && contactPhone.label ? ` · ${contactPhone.label}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {composerMode === 'message' && sendablePhones.length === 0 && (
                <p className="composer-help">Add a routing phone number to send SMS. You can still save internal notes.</p>
              )}
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={composerMode === 'note' ? 'Write an internal note about this contact' : 'Write an SMS message'}
                rows={2}
              />
              <div className="composer-row composer-actions">
                {composerMode === 'note' ? (
                  <button type="button" disabled={!message.trim()} onClick={handleAddNote}>Save note</button>
                ) : (
                  <>
                    <button type="button" disabled={!selectedPhone || !message.trim()} onClick={() => handleSend(false)}>Send SMS</button>
                    <button type="button" disabled={!selectedPhone || (!message.trim() && !scheduledItem)} onClick={handleScheduleClick}>
                      Schedule send
                    </button>
                  </>
                )}
              </div>
            </footer>

            {isScheduleModalOpen && (
              <div className="schedule-modal-backdrop" role="presentation">
                <section className="schedule-modal" aria-label="Schedule SMS">
                  <button
                    type="button"
                    className="call-close"
                    onClick={() => setIsScheduleModalOpen(false)}
                    aria-label="Close schedule modal"
                  >
                    ×
                  </button>
                  <div>
                    <p className="communications-kicker">Schedule send</p>
                    <h2>{scheduledItem ? 'Edit scheduled SMS' : 'Schedule SMS'}</h2>
                  </div>
                  <label>
                    Message
                    <textarea
                      value={scheduleBody}
                      onChange={(event) => setScheduleBody(event.target.value)}
                      rows={4}
                    />
                  </label>
                  <label>
                    Send at
                    <input
                      type="datetime-local"
                      value={scheduleSendAt}
                      onChange={(event) => setScheduleSendAt(event.target.value)}
                    />
                  </label>
                  <div className="schedule-modal-actions">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setIsScheduleModalOpen(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" disabled={!scheduleBody.trim() || !scheduleSendAt} onClick={handleSaveSchedule}>
                      Save schedule
                    </button>
                  </div>
                </section>
              </div>
            )}

            {isCalling && (
              <div className="call-modal-backdrop" role="presentation">
                <section className="call-modal" aria-label="Phone dialer">
                  <button type="button" className="call-close" onClick={closeCallModal} aria-label="Close call modal">
                    ×
                  </button>
                  <div className="call-modal-header">
                    <span className="contact-avatar large">{conversationInitial(selected)}</span>
                    <div>
                      <p className="communications-kicker">Phone dialer</p>
                      <h2>{conversationLabel(selected)}</h2>
                    </div>
                  </div>
                  <label className="call-number-wrap">
                    Phone number
                    {sendablePhones.length > 1 ? (
                      <select className="call-number-input" value={selectedPhone} onChange={(event) => setSelectedPhone(event.target.value)}>
                        {sendablePhones.map((contactPhone) => (
                          <option key={contactPhone.id} value={contactPhone.phoneNumber}>
                            {phone(contactPhone.phoneNumber)}
                            {'label' in contactPhone && contactPhone.label ? ` · ${contactPhone.label}` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input className="call-number-input" value={phone(selectedPhone)} readOnly />
                    )}
                  </label>
                  <label className="call-notes-wrap">
                    Notes
                    <textarea
                      className="call-notes"
                      value={callNoteDraft}
                      onChange={(event) => {
                        setCallNoteDraft(event.target.value);
                        setCallNoteSaveError('');
                      }}
                      placeholder="Add notes during or after the call..."
                    />
                  </label>
                  {callNoteSaveError && <p className="call-note-error">{callNoteSaveError}</p>}
                  <div className={`call-status ${browserCallStatus}`}>
                    <strong>{callStatusText(browserCallStatus)}</strong>
                    {browserCallStatus === 'in-call' && <span>{formatDuration(elapsedSeconds)}</span>}
                    {browserCallError && <p>{browserCallError}</p>}
                  </div>
                  <div className="call-controls">
                    <button
                      type="button"
                      onClick={saveCallNoteAndClose}
                      disabled={isSavingCallNote}
                    >
                      {isSavingCallNote ? 'Saving...' : 'Save and close'}
                    </button>
                    <button
                      type="button"
                      className="call-mute"
                      disabled={browserCallStatus !== 'in-call'}
                      onClick={toggleMute}
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button
                      type="button"
                      className={`call-start ${browserCallStatus === 'in-call' || browserCallStatus === 'ringing' ? 'danger' : ''}`}
                      disabled={!selectedPhone || browserCallStatus === 'connecting'}
                      onClick={browserCallStatus === 'in-call' || browserCallStatus === 'ringing' ? hangUpCall : startBrowserCall}
                    >
                      <LocalPhoneOutlinedIcon fontSize="small" />
                      {browserCallStatus === 'in-call' || browserCallStatus === 'ringing' ? 'Hang up' : 'Call via Keep.id'}
                    </button>
                  </div>
                </section>
              </div>
            )}
          </>
        ) : (
          <div className="empty-chat">
            <h2>Select a contact</h2>
            <p>Recent messages, calls, voicemail transcripts, scheduled messages, and notes will appear here.</p>
          </div>
        )}
      </section>

      {isCreateContactOpen && (
        <CreateContactModal
          onClose={() => setIsCreateContactOpen(false)}
          onCreated={(contact) => {
            updateContactInList(contact);
            setContactNotice('');
            setComposerMode('message');
            setSelectedContactId(contact.id);
            setIsCreateContactOpen(false);
          }}
        />
      )}

      {isContactEditorOpen && selected && (
        <ContactEditorSheet
          contact={selected}
          contacts={conversations}
          onClose={() => setIsContactEditorOpen(false)}
          onChanged={updateContactInList}
          onSelectContact={(contactId) => {
            setContactNotice('');
            setComposerMode('message');
            setMessage('');
            setSelectedContactId(contactId);
            setIsContactEditorOpen(false);
          }}
          onPromoted={handleContactPromotion}
        />
      )}
    </main>
  );
}
