import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isPermissionError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
            errorMessage = "You don't have permission to access this data. Please ensure you are logged in correctly.";
            isPermissionError = true;
          }
        }
      } catch (e) {
        // Not a JSON error message
        if (this.state.error?.message.includes('permission-denied')) {
          errorMessage = "Access Denied: You don't have permission to perform this action.";
          isPermissionError = true;
        }
      }

      return (
        <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0A0A0A] flex items-center justify-center p-4 md:p-6 font-serif transition-colors">
          <div className="max-w-md w-full bg-white dark:bg-[#1C1C1C] rounded-2xl md:rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-black/5 dark:border-white/5 text-center space-y-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold dark:text-white">Oops! Something went wrong</h2>
              <p className="text-[#1a1a1a]/60 dark:text-white/60 font-sans text-xs md:text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full bg-[#1a1a1a] dark:bg-[#A8A878] text-white dark:text-black py-3 md:py-4 rounded-xl md:rounded-full font-sans font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm md:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            {isPermissionError && (
              <p className="text-[9px] md:text-[10px] font-sans opacity-30 dark:opacity-50 uppercase tracking-widest dark:text-white">
                Error Code: PERMISSION_DENIED
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
