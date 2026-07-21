import React from 'react';

type TranscriptSide = 'left' | 'right';

type TranscriptTurn = {
  id: string;
  speaker: string;
  side: TranscriptSide;
  text: string;
};

const SPEAKER_LABEL = /(?:^|\s)(Caller|Client|Staff|Agent|Keep\.?id(?: staff)?|Steffen|Stefan):\s*/gi;

function speakerDetails(value: string): Pick<TranscriptTurn, 'speaker' | 'side'> {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized === 'caller' || normalized === 'client') {
    return { speaker: 'Caller', side: 'left' };
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

type Props = {
  transcript: string;
};

export default function CallTranscript({ transcript }: Props) {
  const turns = parseTranscript(transcript);
  if (turns.length === 0) return null;

  return (
    <div className="call-transcript" aria-label="Call transcript" role="list">
      {turns.map((turn) => (
        <div
          className={`call-transcript-turn ${turn.side}`}
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
