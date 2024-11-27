import React, { useEffect } from 'react';
import { Prompt } from 'react-router';

interface EnhancedPromptProps {
  shouldPrompt?: boolean;
}

const message = 'Click "Ok" if you are sure you want to leave this page. Any unsaved data will be lost.';
const eventName = 'beforeunload';

const handleEvent = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  return true;
};

export default function EnhancedPrompt({ shouldPrompt = true }: EnhancedPromptProps) {
  useEffect(() => {
    if (shouldPrompt) {
      window.addEventListener(eventName, handleEvent);
      return () => {
        window.removeEventListener(eventName, handleEvent);
      };
    }
    return () => {};
  }, [shouldPrompt]);

  return (
    <Prompt when={shouldPrompt} message={message} />
  );
}
