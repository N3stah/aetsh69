import React from 'react';

interface State { hasError: boolean; }

class ErrorBoundary extends React.Component<{children: React.ReactNode}, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Render nothing if it crashes, so the rest of the site stays up
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
