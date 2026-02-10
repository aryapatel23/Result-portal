import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-red-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Something went wrong!
                </h2>
                <p className="text-gray-600 mb-6">
                  We apologize for the inconvenience. The application encountered an unexpected error.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 font-medium"
                >
                  Go to Homepage
                </button>
                
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-8 text-left">
                    <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-4 text-xs text-gray-700 bg-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                      {this.state.error && this.state.error.toString()}
                      <br />
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;