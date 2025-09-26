import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-pink-100 to-white p-6">
          <div className="mx-auto max-w-xl rounded-2xl border bg-white/70 p-6 shadow">
            <h1 className="text-xl font-bold text-pink-700">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-700">The page failed to render. Please try a hard refresh (Ctrl+Shift+R). If the issue persists, share the console error with us.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
