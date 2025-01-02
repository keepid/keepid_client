import React, { useEffect } from 'react';
import { Prompt } from 'react-router';

interface EnhancedPromptProps {
  shouldPrompt?: boolean;
  message?: string;
}

const defaultMessage = 'Click "Ok" if you are sure you want to leave this page. Any unsaved data will be lost.';
const eventName = 'beforeunload';

const handleEvent = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  return true;
};

export default function PromptOnLeave({ shouldPrompt = true, message }: EnhancedPromptProps) {
  useEffect(() => {
    if (shouldPrompt) {
      window.addEventListener(eventName, handleEvent);
      return () => {
        window.removeEventListener(eventName, handleEvent);
      };
    }
    return () => {};
  }, [shouldPrompt]);

  const promptMessage = message || defaultMessage;

  return (
    <Prompt when={shouldPrompt} message={promptMessage} />
  );
}
