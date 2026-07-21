import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
          <p className="text-rust font-mono text-sm mb-2">Error</p>
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Something went wrong</h2>
          <p className="text-ink-muted text-sm mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary text-sm">Reload page</button>
        </div>
      );
    }
    return this.props.children;
  }
}
