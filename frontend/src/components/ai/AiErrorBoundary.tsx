'use client';

import { Component, ReactNode } from 'react';

interface State { hasError: boolean }

/**
 * Tiny class-based error boundary that wraps the AI layer.
 *
 * Why: the AI advisor reads data from many sources and runs many client-side
 * computations. We never want a bug in the AI layer to take down the entire
 * dashboard — it's strictly advisory. If anything inside throws, we render
 * nothing and let the rest of the app continue.
 *
 * In dev the error is logged so we can diagnose.
 */
export default class AiErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined') console.warn('[NextNova AI] suppressed render error:', error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
