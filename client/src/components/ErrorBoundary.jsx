import React from 'react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-color)] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertOctagon size={40} className="text-red-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md">
            Our systems encountered an unexpected error. Don't worry, your data is safe and synced.
          </p>
          <div className="bg-black/50 border border-red-500/20 p-4 rounded-xl text-left font-mono text-sm text-red-400 max-w-2xl overflow-auto mb-8">
            {this.state.error && this.state.error.toString()}
          </div>
          <button 
            onClick={this.handleReload}
            className="flex items-center gap-2 bg-[var(--primary-color)] text-black font-bold py-3 px-8 rounded-xl hover:bg-[var(--primary-hover)] transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
          >
            <RefreshCcw size={20} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
