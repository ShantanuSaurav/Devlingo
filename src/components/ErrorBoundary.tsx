import React from 'react';

interface State {
  error: Error | null;
}

/**
 * Without this, one bad render anywhere unmounts the entire page and leaves a
 * blank white screen with the reason only in the console.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CodeQuest] render failed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="crash-screen">
        <h1>Something broke.</h1>
        <p>
          The page hit an error it could not recover from. Your progress is saved in this browser,
          so reloading will not lose it.
        </p>
        <pre>{this.state.error.message}</pre>
        <div className="crash-actions">
          <button type="button" className="btn btn-solid" onClick={() => window.location.reload()}>
            Reload the page
          </button>
          <button
            type="button"
            className="btn btn-line"
            onClick={() => this.setState({ error: null })}
          >
            Try to continue
          </button>
        </div>
      </div>
    );
  }
}
