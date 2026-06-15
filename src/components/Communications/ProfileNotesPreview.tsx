import './communications.css';

import React from 'react';

const timelineGroups = [
  {
    date: 'June 15, 2026',
    items: [
      {
        title: 'Call note',
        body: 'Client called after finding birth certificate. Asked us to confirm proof of address options.',
        time: '2:42 PM',
        source: 'Communication',
      },
      {
        title: 'Worker note',
        body: 'Plan: enroll tomorrow morning, then send PennDOT packet after document scan.',
        time: '2:48 PM',
        source: 'Profile',
      },
      {
        title: 'Message',
        body: 'Client confirmed she can bring the birth certificate tomorrow morning.',
        time: '2:55 PM',
        source: 'SMS',
      },
    ],
  },
  {
    date: 'June 12, 2026',
    items: [
      {
        title: 'Voicemail transcript',
        body: 'Voicemail transcript was attached to this profile after phone number match.',
        time: '11:16 AM',
        source: 'Communication',
      },
    ],
  },
  {
    date: 'Migrated notes',
    items: [
      {
        title: 'Legacy worker notes',
        body: 'Existing freeform profile notes are migrated into the timeline with the migration date, preserving the original text as one dated entry.',
        time: 'Jun 15, 2026',
        source: 'Profile',
      },
    ],
  },
];

export default function ProfileNotesPreview() {
  return (
    <main className="profile-notes-preview">
      <section className="profile-preview-header">
        <span className="contact-avatar large">M</span>
        <div>
          <p className="communications-kicker">Client profile</p>
          <h1>Maria Rivera</h1>
          <p>(215) 555-0142 · Reachable · 3 messages · 2 calls</p>
        </div>
      </section>

      <section className="profile-notes-card">
        <div className="message-board-header">
          <div>
            <p className="communications-kicker">Client timeline</p>
            <h2>Notes & Communication History</h2>
            <p>Worker notes, call notes, messages, voicemail transcripts, and migrated notes are grouped by date.</p>
          </div>
          <button type="button" className="btn btn-primary">Add note</button>
        </div>

        <div className="client-timeline">
          {timelineGroups.map((group, index) => (
            <details key={group.date} className="timeline-day" open={index < 2}>
              <summary>
                <span>{group.date}</span>
                <small>{group.items.length} entries</small>
              </summary>
              <div className="timeline-items">
                {group.items.map((item) => (
                  <article key={`${group.date}-${item.time}-${item.title}`} className="timeline-entry">
                    <span className="timeline-dot" />
                    <div>
                      <div className="timeline-entry-top">
                        <strong>{item.title}</strong>
                        <span>{item.time}</span>
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
      </section>
    </main>
  );
}
