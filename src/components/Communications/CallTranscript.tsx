import React from 'react';

import type { CallTranscriptSegment } from './communicationsApi';

type TranscriptSide = 'left' | 'right';

type TranscriptTurn = {
  id: string;
  speaker: string;
  side: TranscriptSide;
  text: string;
  audio?: boolean;
};

const SPEAKER_LABEL = /(?:^|\s)(Automated assistant|AI assistant|Keep\.?id AI|Caller|Client|Staff|Agent|Keep\.?id(?: staff)?|Steffen|Stefan):\s*/gi;

function speakerDetails(value: string): Pick<TranscriptTurn, 'speaker' | 'side'> {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized === 'caller' || normalized === 'client') {
    return { speaker: 'Caller', side: 'left' };
  }
  if (normalized === 'automatedassistant' || normalized === 'aiassistant' || normalized === 'keepidai') {
    return { speaker: 'Keep.id AI', side: 'right' };
  }
  if (normalized === 'steffen' || normalized === 'stefan') {
    return { speaker: value, side: 'right' };
  }
  return { speaker: 'Keep.id staff', side: 'right' };
}

function parseTranscript(transcript: string): TranscriptTurn[] {
  const matches = [...transcript.matchAll(SPEAKER_LABEL)];
  if (matches.length === 0) {
    return transcript.trim()
      ? [{ id: 'unlabeled-0', speaker: 'Transcript', side: 'left', text: transcript.trim() }]
      : [];
  }

  const turns: TranscriptTurn[] = [];
  const leadingText = transcript.slice(0, matches[0].index).trim();
  if (leadingText) {
    turns.push({ id: 'unlabeled-0', speaker: 'Transcript', side: 'left', text: leadingText });
  }

  matches.forEach((match, index) => {
    const start = (match.index || 0) + match[0].length;
    const end = matches[index + 1]?.index ?? transcript.length;
    const text = transcript.slice(start, end).trim();
    if (!text) return;
    turns.push({ id: `turn-${match.index || 0}`, ...speakerDetails(match[1]), text });
  });

  return turns;
}

function turnsFromSegments(segments: CallTranscriptSegment[]): TranscriptTurn[] {
  return segments.map((segment, index) => {
    const id = `segment-${index}`;
    switch (segment.speaker) {
      case 'caller':
        return {
          id, speaker: 'Caller', side: 'left', text: segment.text,
        };
      case 'assistant':
        return {
          id,
          speaker: segment.kind === 'greeting' ? 'Keep.id AI greeting' : 'Keep.id AI',
          side: 'right',
          text: segment.text,
        };
      case 'staff':
        return {
          id, speaker: 'Keep.id staff', side: 'right', text: segment.text,
        };
      case 'call_audio':
        // Audio Twilio played to the caller (menu, voicemail greeting, forwarded leg), not a person.
        return {
          id, speaker: 'Call audio', side: 'right', text: segment.text, audio: true,
        };
      default:
        return {
          id, speaker: 'Transcript', side: 'left', text: segment.text,
        };
    }
  });
}

type Props = {
  transcript: string;
  /** Decoded by the server. When present it is used instead of parsing the text. */
  segments?: CallTranscriptSegment[];
};

export default function CallTranscript({ transcript, segments }: Props) {
  const turns = segments && segments.length > 0
    ? turnsFromSegments(segments)
    : parseTranscript(transcript);
  if (turns.length === 0) return null;

  return (
    <div className="call-transcript" aria-label="Call transcript" role="list">
      {turns.map((turn) => (
        <div
          className={`call-transcript-turn ${turn.side}${turn.audio ? ' audio' : ''}`}
          key={turn.id}
          role="listitem"
        >
          <span>{turn.speaker}</span>
          <p>{turn.text}</p>
        </div>
      ))}
    </div>
  );
}
