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
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6 font-serif">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-black/5 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
              <p className="text-[#1a1a1a]/60 font-sans text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-sans font-bold flex items-center justify-center gap-2 hover:bg-[#333] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            {isPermissionError && (
              <p className="text-[10px] font-sans opacity-30 uppercase tracking-widest">
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
