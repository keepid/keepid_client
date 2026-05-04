/**
 * Error boundary so a bug in the install-prompt feature can never crash the
 * surrounding Keep.ID app. If anything in the install UI throws, we silently
 * render nothing.
 */

import React from 'react';

import { pwaError } from '../../lib/pwa/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class InstallPromptErrorBoundary extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    pwaError('InstallPrompt crashed:', error, info);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
